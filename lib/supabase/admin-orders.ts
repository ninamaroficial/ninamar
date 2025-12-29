import { createAdminClient } from './admin'

export async function getOrderStats() {
  const supabase = createAdminClient()

  // Total de órdenes por estado
  const { data: orders } = await supabase
    .from('orders')
    .select('status, payment_status, total, created_at')

  if (!orders) {
    return {
      total_orders: 0,
      pending_orders: 0,
      paid_orders: 0,
      processing_orders: 0,
      shipped_orders: 0,
      delivered_orders: 0,
      total_revenue: 0,
      today_orders: 0,
      today_revenue: 0
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const stats = {
    total_orders: orders.length,
    pending_orders: orders.filter(o => o.status === 'pending').length,
    paid_orders: orders.filter(o => o.status === 'paid').length,
    processing_orders: orders.filter(o => o.status === 'processing').length,
    shipped_orders: orders.filter(o => o.status === 'shipped').length,
    delivered_orders: orders.filter(o => o.status === 'delivered').length,
    total_revenue: orders
      .filter(o => o.payment_status === 'approved')
      .reduce((sum, o) => sum + Number(o.total), 0),
    today_orders: orders.filter(o => new Date(o.created_at) >= today).length,
    today_revenue: orders
      .filter(o => 
        o.payment_status === 'approved' && 
        new Date(o.created_at) >= today
      )
      .reduce((sum, o) => sum + Number(o.total), 0)
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