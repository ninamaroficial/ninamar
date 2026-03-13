import { createAdminClient } from './admin'

// Métodos de pago manuales que NO tienen comisión de MercadoPago
const MANUAL_PAYMENT_METHODS = ['efectivo', 'nequi', 'transferencia', 'daviplata', 'otro']

// Verificar si un método de pago es manual (sin comisión MP)
function isManualPayment(paymentMethod?: string): boolean {
  if (!paymentMethod) return false
  return MANUAL_PAYMENT_METHODS.includes(paymentMethod.toLowerCase())
}

// Calcular gastos de MercadoPago (3.29% + IVA 19% + $952 fijo)
// Solo aplica para pagos procesados por MercadoPago (tarjetas, PSE, etc.)
// La comisión se calcula sobre el TOTAL (productos + envío)
// Fórmula: (Total × 3.29% × 1.19) + $952 = (Total × 0.039151) + $952
function calculateMercadoPagoFees(total: number, paymentMethod?: string): number {
  // Si es pago manual (efectivo, nequi, etc.), no hay comisión
  if (isManualPayment(paymentMethod)) {
    return 0
  }
  // Si es pago por MercadoPago, aplicar comisión sobre el total
  // 3.29% + IVA (19%) + cargo fijo de $952
  return (total * 0.0329 * 1.19) + 952
}

// Obtener subtotal seguro (manejar datos legacy)
function getSafeSubtotal(order: any): number {
  // Si existe subtotal, usarlo
  if (order.subtotal != null && !isNaN(Number(order.subtotal))) {
    return Number(order.subtotal)
  }
  
  // Si no existe subtotal pero sí shipping_cost, calcular: total - shipping
  if (order.shipping_cost != null && !isNaN(Number(order.shipping_cost))) {
    const total = Number(order.total) || 0
    const shipping = Number(order.shipping_cost)
    return Math.max(0, total - shipping)
  }
  
  // Si no hay shipping_cost, asumir que todo el total es subtotal
  return Number(order.total) || 0
}

// Obtener shipping cost seguro
function getSafeShippingCost(order: any): number {
  if (order.shipping_cost != null && !isNaN(Number(order.shipping_cost))) {
    return Number(order.shipping_cost)
  }
  return 0
}

export async function getOrderStats() {
  const supabase = createAdminClient()

  // Total de órdenes por estado - Traer todos los campos necesarios
  const { data: orders } = await supabase
    .from('orders')
    .select('status, payment_status, total, subtotal, shipping_cost, payment_method, created_at')

  if (!orders) {
    return {
      total_orders: 0,
      pending_orders: 0,
      paid_orders: 0,
      processing_orders: 0,
      shipped_orders: 0,
      delivered_orders: 0,
      total_revenue: 0,
      net_revenue: 0,
      mercadopago_fees: 0,
      shipping_costs: 0,
      today_orders: 0,
      today_revenue: 0,
      today_net_revenue: 0
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Filtrar órdenes pagadas
  const paidOrders = orders.filter(o => o.payment_status === 'approved')
  const paidOrdersToday = orders.filter(o => 
    o.payment_status === 'approved' && 
    new Date(o.created_at) >= today
  )

  // Calcular ingresos brutos (total facturado = productos + envío)
  const totalGrossRevenue = paidOrders.reduce((sum, o) => {
    const subtotal = getSafeSubtotal(o)
    const shipping = getSafeShippingCost(o)
    const total = subtotal + shipping
    return sum + (isNaN(total) ? 0 : total)
  }, 0)
  const todayGrossRevenue = paidOrdersToday.reduce((sum, o) => {
    const subtotal = getSafeSubtotal(o)
    const shipping = getSafeShippingCost(o)
    const total = subtotal + shipping
    return sum + (isNaN(total) ? 0 : total)
  }, 0)

  // Calcular gastos de MercadoPago (solo para pagos NO manuales, sobre el TOTAL)
  const totalMercadoPagoFees = paidOrders.reduce((sum, o) => {
    const subtotal = getSafeSubtotal(o)
    const shipping = getSafeShippingCost(o)
    const total = subtotal + shipping
    const value = calculateMercadoPagoFees(total, o.payment_method)
    return sum + (isNaN(value) ? 0 : value)
  }, 0)
  const todayMercadoPagoFees = paidOrdersToday.reduce((sum, o) => {
    const subtotal = getSafeSubtotal(o)
    const shipping = getSafeShippingCost(o)
    const total = subtotal + shipping
    const value = calculateMercadoPagoFees(total, o.payment_method)
    return sum + (isNaN(value) ? 0 : value)
  }, 0)

  // Calcular gastos de envío (costo que pagas a transportadora)
  const shippingCosts = paidOrders.reduce((sum, o) => {
    const value = getSafeShippingCost(o)
    return sum + (isNaN(value) ? 0 : value)
  }, 0)
  const todayShippingCosts = paidOrdersToday.reduce((sum, o) => {
    const value = getSafeShippingCost(o)
    return sum + (isNaN(value) ? 0 : value)
  }, 0)

  // Calcular ingresos netos (lo que realmente ganas)
  // Neto = Brutos - MP fees - Envíos
  const totalNetRevenue = totalGrossRevenue - totalMercadoPagoFees - shippingCosts
  const todayNetRevenue = todayGrossRevenue - todayMercadoPagoFees - todayShippingCosts

  const stats = {
    total_orders: orders.length,
    pending_orders: orders.filter(o => o.status === 'pending').length,
    paid_orders: orders.filter(o => o.status === 'paid').length,
    processing_orders: orders.filter(o => o.status === 'processing').length,
    shipped_orders: orders.filter(o => o.status === 'shipped').length,
    delivered_orders: orders.filter(o => o.status === 'delivered').length,
    
    // Ingresos brutos (total facturado = productos + envío)
    total_revenue: totalGrossRevenue,
    
    // Ingreso neto (lo que realmente ganas después de gastos)
    net_revenue: totalNetRevenue,
    
    // Desglose de gastos
    mercadopago_fees: totalMercadoPagoFees,
    shipping_costs: shippingCosts,
    
    today_orders: orders.filter(o => new Date(o.created_at) >= today).length,
    today_revenue: todayGrossRevenue,
    today_net_revenue: todayNetRevenue
  }

  return stats
}

export async function getOrdersList(filters?: {
  status?: string
  payment_status?: string
  search?: string
  limit?: number
  offset?: number
}) {
  const supabase = createAdminClient()

  let query = supabase
    .from('orders')
    .select(`
      id,
      order_number,
      customer_name,
      customer_email,
      customer_phone,
      total,
      status,
      payment_status,
      payment_method,
      created_at,
      order_items!inner(id)
    `, { count: 'exact' })

  // Aplicar filtros
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.payment_status) {
    query = query.eq('payment_status', filters.payment_status)
  }

  if (filters?.search) {
    query = query.or(`order_number.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%`)
  }

  // Ordenar por más reciente
  query = query.order('created_at', { ascending: false })

  // Paginación
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching orders:', error)
    return { orders: [], total: 0 }
  }

  // Transformar datos para incluir count de items
  const orders = data?.map(order => ({
    ...order,
    items_count: Array.isArray(order.order_items) ? order.order_items.length : 0,
    order_items: undefined // Remover para limpiar respuesta
  })) || []

  return {
    orders,
    total: count || 0
  }
}

interface AnalyticsPoint {
  label: string
  value: number
}

interface OrderAnalytics {
  monthly_revenue: AnalyticsPoint[]
  top_products: AnalyticsPoint[]
  top_product_types: AnalyticsPoint[]
  top_states: AnalyticsPoint[]
  top_cities: AnalyticsPoint[]
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function slugifyFallback(value: string): string {
  return normalizeText(value)
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function classifyProductType(productName: string, productSlug?: string): string {
  const slug = normalizeText(productSlug || '')
  const name = normalizeText(productName)

  // Primero intentamos detectar por slug, porque suele tener el tipo explícito.
  if (slug.includes('arete') || slug.includes('pendiente') || slug.includes('candonga') || slug.includes('topo')) return 'Aretes'
  if (slug.includes('collar') || slug.includes('gargantilla') || slug.includes('choker')) return 'Collares'
  if (slug.includes('pulsera') || slug.includes('manilla') || slug.includes('brazalete')) return 'Pulseras'
  if (slug.includes('anillo') || slug.includes('sortija')) return 'Anillos'
  if (slug.includes('tobillera')) return 'Tobilleras'
  if (slug.includes('set') || slug.includes('combo') || slug.includes('kit')) return 'Sets / Combos'
  if (slug.includes('llavero')) return 'Llaveros'

  if (
    name.includes('arete') ||
    name.includes('pendiente') ||
    name.includes('candonga') ||
    name.includes('topo')
  ) {
    return 'Aretes'
  }

  if (
    name.includes('collar') ||
    name.includes('gargantilla') ||
    name.includes('choker')
  ) {
    return 'Collares'
  }

  if (name.includes('pulsera') || name.includes('manilla') || name.includes('brazalete')) return 'Pulseras'
  if (name.includes('anillo') || name.includes('sortija')) return 'Anillos'
  if (name.includes('tobillera')) return 'Tobilleras'
  if (name.includes('set') || name.includes('combo') || name.includes('kit')) return 'Sets / Combos'
  if (name.includes('llavero')) return 'Llaveros'

  return 'Otros'
}

export async function getOrdersAnalytics(): Promise<OrderAnalytics> {
  const supabase = createAdminClient()

  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, created_at, payment_status, status, total, shipping_city, shipping_state')

  const { data: paidItems, error: paidItemsError } = await supabase
    .from('order_items')
    .select('product_name, product_slug, quantity, orders!inner(payment_status)')
    .eq('orders.payment_status', 'approved')

  if (error || !orders || paidItemsError) {
    console.error('Error fetching analytics:', error)
    if (paidItemsError) {
      console.error('Error fetching paid order items for analytics:', paidItemsError)
    }
    return {
      monthly_revenue: [],
      top_products: [],
      top_product_types: [],
      top_states: [],
      top_cities: [],
    }
  }

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  const monthSlots = Array.from({ length: currentMonth + 1 }, (_, idx) => {
    const d = new Date(currentYear, idx, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('es-CO', { month: 'short' })
    return { key, label }
  })

  const monthRevenueMap = new Map<string, number>(monthSlots.map((m) => [m.key, 0]))
  const productQtyMap = new Map<string, number>()
  const productTypeQtyMap = new Map<string, number>()
  const stateCountMap = new Map<string, number>()
  const cityCountMap = new Map<string, number>()

  for (const order of orders as any[]) {
    const createdAt = new Date(order.created_at)
    const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`
    const total = Number(order.total) || 0

    // Ingresos mensuales: solo órdenes pagadas.
    if (order.payment_status === 'approved' && monthRevenueMap.has(monthKey)) {
      monthRevenueMap.set(monthKey, (monthRevenueMap.get(monthKey) || 0) + total)
    }

    // Destinos: solo órdenes que sí se enviaron.
    if (order.status === 'shipped' || order.status === 'delivered') {
      const state = (order.shipping_state || 'Sin departamento').trim()
      const city = (order.shipping_city || 'Sin ciudad').trim()
      stateCountMap.set(state, (stateCountMap.get(state) || 0) + 1)
      cityCountMap.set(city, (cityCountMap.get(city) || 0) + 1)
    }

  }

  for (const item of (paidItems || []) as any[]) {
    const name = String(item?.product_name || 'Producto sin nombre').trim()
    const slug = String(item?.product_slug || '').trim()
    const qty = Number(item?.quantity) || 0
    if (qty <= 0) continue

    const productKey = slug || slugifyFallback(name) || 'producto-sin-slug'
    productQtyMap.set(productKey, (productQtyMap.get(productKey) || 0) + qty)

    const type = classifyProductType(name, item?.product_slug)
    productTypeQtyMap.set(type, (productTypeQtyMap.get(type) || 0) + qty)
  }

  const monthly_revenue = monthSlots.map((slot) => ({
    label: slot.label,
    value: Math.round(monthRevenueMap.get(slot.key) || 0),
  }))

  const toTopList = (map: Map<string, number>, limit = 8): AnalyticsPoint[] => {
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([label, value]) => ({ label, value }))
  }

  return {
    monthly_revenue,
    top_products: toTopList(productQtyMap, 10),
    top_product_types: toTopList(productTypeQtyMap, 8),
    top_states: toTopList(stateCountMap, 8),
    top_cities: toTopList(cityCountMap, 10),
  }
}

export async function getOrderDetails(orderId: string) {
  const supabase = createAdminClient()

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(*)
    `)
    .eq('id', orderId)
    .single()

  if (error) {
    console.error('Error fetching order details:', error)
    return { data: null, error }
  }

  return { data: order, error: null }
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = createAdminClient()

  const updateData: any = {
    status: status,
    updated_at: new Date().toISOString()
  }

  // Agregar timestamps según estado
  if (status === 'processing') {
    const { data: currentOrder } = await supabase
      .from('orders')
      .select('processing_at')
      .eq('id', orderId)
      .single()
    
    if (!currentOrder?.processing_at) {
      updateData.processing_at = new Date().toISOString()
    }
  } else if (status === 'shipped') {
    const { data: currentOrder } = await supabase
      .from('orders')
      .select('shipped_at, processing_at')
      .eq('id', orderId)
      .single()
    
    // Asegurar que tiene processing_at antes de shipped_at
    if (!currentOrder?.processing_at) {
      updateData.processing_at = new Date().toISOString()
    }
    
    if (!currentOrder?.shipped_at) {
      updateData.shipped_at = new Date().toISOString()
    }
  } else if (status === 'delivered') {
    const { data: currentOrder } = await supabase
      .from('orders')
      .select('delivered_at, shipped_at, processing_at')
      .eq('id', orderId)
      .single()
    
    // Asegurar que tiene todos los timestamps previos
    if (!currentOrder?.processing_at) {
      updateData.processing_at = new Date().toISOString()
    }
    
    if (!currentOrder?.shipped_at) {
      updateData.shipped_at = new Date().toISOString()
    }
    
    if (!currentOrder?.delivered_at) {
      updateData.delivered_at = new Date().toISOString()
    }
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
    .select()
    .single()
  
  if (error) {
    throw new Error('No se pudo actualizar el estado de la orden')
  }
  
  return data
}

export async function updateOrderPaymentStatus(orderId: string, paymentStatus: 'pending' | 'approved' | 'rejected') {
  const supabase = createAdminClient()

  const updateData: any = {
    payment_status: paymentStatus,
    updated_at: new Date().toISOString()
  }

  // Si el pago es aprobado, agregar el timestamp paid_at
  if (paymentStatus === 'approved') {
    const { data: currentOrder } = await supabase
      .from('orders')
      .select('paid_at')
      .eq('id', orderId)
      .single()
    
    if (!currentOrder?.paid_at) {
      updateData.paid_at = new Date().toISOString()
    }
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
    .select()
    .single()
  
  if (error) {
    throw new Error('No se pudo actualizar el estado de pago')
  }
  
  return data
}