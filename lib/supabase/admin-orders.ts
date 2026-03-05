import { createAdminClient } from './admin'

// Métodos de pago manuales que NO tienen comisión de MercadoPago
const MANUAL_PAYMENT_METHODS = ['efectivo', 'nequi', 'transferencia', 'daviplata', 'otro']

// Verificar si un método de pago es manual (sin comisión MP)
function isManualPayment(paymentMethod?: string): boolean {
  if (!paymentMethod) return false
  return MANUAL_PAYMENT_METHODS.includes(paymentMethod.toLowerCase())
}

// Calcular gastos de MercadoPago (3.29% + $800 COP por compra)
// Solo aplica para pagos procesados por MercadoPago (tarjetas, PSE, etc.)
function calculateMercadoPagoFees(subtotal: number, paymentMethod?: string): number {
  // Si es pago manual (efectivo, nequi, etc.), no hay comisión
  if (isManualPayment(paymentMethod)) {
    return 0
  }
  // Si es pago por MercadoPago, aplicar comisión
  return subtotal * 0.0329 + 800
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

  // Calcular ingresos brutos (subtotal = precio de productos)
  const totalGrossRevenue = paidOrders.reduce((sum, o) => sum + getSafeSubtotal(o), 0)
  const todayGrossRevenue = paidOrdersToday.reduce((sum, o) => sum + getSafeSubtotal(o), 0)

  // Calcular gastos de MercadoPago (solo para pagos NO manuales)
  const totalMercadoPagoFees = paidOrders.reduce((sum, o) => 
    sum + calculateMercadoPagoFees(getSafeSubtotal(o), o.payment_method), 0
  )
  const todayMercadoPagoFees = paidOrdersToday.reduce((sum, o) => 
    sum + calculateMercadoPagoFees(getSafeSubtotal(o), o.payment_method), 0
  )

  // Calcular gastos de envío (NO es ingreso, es costo que pagas a transportadora)
  const shippingCosts = paidOrders.reduce((sum, o) => sum + getSafeShippingCost(o), 0)
  const todayShippingCosts = paidOrdersToday.reduce((sum, o) => sum + getSafeShippingCost(o), 0)

  // Calcular ingresos netos (después de comisiones MP y costos de envío)
  const totalNetRevenue = totalGrossRevenue - totalMercadoPagoFees - shippingCosts
  const todayNetRevenue = todayGrossRevenue - todayMercadoPagoFees - todayShippingCosts

  const stats = {
    total_orders: orders.length,
    pending_orders: orders.filter(o => o.status === 'pending').length,
    paid_orders: orders.filter(o => o.status === 'paid').length,
    processing_orders: orders.filter(o => o.status === 'processing').length,
    shipped_orders: orders.filter(o => o.status === 'shipped').length,
    delivered_orders: orders.filter(o => o.status === 'delivered').length,
    
    // Ingresos brutos (solo productos, sin envíos)
    total_revenue: totalGrossRevenue,
    
    // Ingreso neto (ingresos - comisiones MP - costos de envío)
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