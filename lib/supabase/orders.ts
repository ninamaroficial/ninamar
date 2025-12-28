import { createClient } from './server'
import type { CreateOrderData, Order, OrderItem } from '@/types/order.types'

export async function createOrder(data: CreateOrderData) {
  const supabase = await createClient()
  
  // Calcular totales
  const subtotal = data.items.reduce((sum, item) => sum + item.total_price, 0)
  const shipping_cost = 0 // Por ahora gratis, después puedes calcularlo
  const total = subtotal + shipping_cost
  
  // Generar número de orden
  const { data: orderNumberData, error: orderNumberError } = await supabase
    .rpc('generate_order_number')
  
  if (orderNumberError) {
    console.error('Error generating order number:', orderNumberError)
    throw new Error('No se pudo generar el número de orden')
  }
  
  // Crear orden
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumberData,
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      customer_document: data.customer_document,
      shipping_address: data.shipping_address,
      shipping_city: data.shipping_city,
      shipping_state: data.shipping_state,
      shipping_zip: data.shipping_zip,
      shipping_country: 'Colombia',
      subtotal: subtotal,
      shipping_cost: shipping_cost,
      total: total,
      status: 'pending',
      payment_status: 'pending',
      customer_notes: data.customer_notes
    })
    .select()
    .single()
  
  if (orderError) {
    console.error('Error creating order:', orderError)
    throw new Error('No se pudo crear la orden')
  }
  
  // Crear items de la orden
  const orderItems = data.items.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name: item.product_name,
    product_slug: item.product_slug,
    product_image: item.product_image,
    base_price: item.base_price,
    customization_details: item.customization_details,
    engraving: item.engraving,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.total_price
  }))
  
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)
  
  if (itemsError) {
    console.error('Error creating order items:', itemsError)
    // Intentar borrar la orden si falla
    await supabase.from('orders').delete().eq('id', order.id)
    throw new Error('No se pudieron agregar los productos a la orden')
  }
  
  return order as Order
}

export async function getOrder(orderId: string) {
  const supabase = await createClient()
  
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('id', orderId)
    .single()
  
  if (error) {
    console.error('Error fetching order:', error)
    return null
  }
  
  return order
}

export async function updateOrderPaymentStatus(
  orderId: string, 
  paymentId: string, 
  paymentStatus: 'approved' | 'rejected',
  paymentMethod: string
) {
  const supabase = await createClient()
  
  const updateData: any = {
    payment_id: paymentId,
    payment_status: paymentStatus,
    payment_method: paymentMethod
  }
  
  if (paymentStatus === 'approved') {
    updateData.status = 'paid'
    updateData.paid_at = new Date().toISOString()
  }
  
  const { error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
  
  if (error) {
    console.error('Error updating order payment:', error)
    throw new Error('No se pudo actualizar el estado del pago')
  }
}