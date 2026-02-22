/**
 * WhatsApp Bot - Order Functions
 * Crear órdenes y consultar estado desde WhatsApp
 */

import { createAdminClient } from '@/lib/supabase/admin'
import type { ConversationSession } from './session'

const STATUS_LABELS: Record<string, string> = {
  pending: '⏳ Pendiente',
  paid: '💳 Pagado',
  processing: '⚙️ En preparación',
  shipped: '🚚 Enviado',
  delivered: '✅ Entregado',
  cancelled: '❌ Cancelado',
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: '⏳ Pendiente',
  approved: '✅ Aprobado',
  rejected: '❌ Rechazado',
}

/**
 * Crear una orden desde el flujo de WhatsApp
 */
export async function createWhatsAppOrder(session: ConversationSession) {
  const supabase = createAdminClient()
  
  const subtotal = session.cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  
  // Envío por definir (se puede ajustar)
  const shippingCost = 0
  const total = subtotal + shippingCost
  
  // Generar número de orden
  const { data: orderNumber, error: orderNumberError } = await supabase
    .rpc('generate_order_number')
  
  if (orderNumberError) {
    console.error('Error generating order number:', orderNumberError)
    throw new Error('No se pudo generar el número de orden')
  }
  
  // Crear la orden
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_name: session.customer_name || 'Cliente WhatsApp',
      customer_email: session.customer_email || '',
      customer_phone: session.phone,
      customer_document: session.customer_document || '',
      shipping_address: session.customer_address || '',
      shipping_city: session.customer_city || '',
      shipping_state: session.customer_state || '',
      shipping_country: 'Colombia',
      subtotal,
      shipping_cost: shippingCost,
      total,
      status: 'pending',
      payment_status: 'pending',
      customer_notes: 'Pedido realizado por WhatsApp 📱',
    })
    .select()
    .single()
  
  if (orderError) {
    console.error('Error creating WhatsApp order:', orderError)
    throw new Error('No se pudo crear la orden')
  }
  
  // Crear items
  const orderItems = session.cart.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name: item.product_name,
    product_slug: item.product_slug,
    product_image: item.product_image,
    base_price: item.price,
    quantity: item.quantity,
    unit_price: item.price,
    total_price: item.price * item.quantity,
  }))
  
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)
  
  if (itemsError) {
    console.error('Error creating order items:', itemsError)
    // Eliminar orden si los items fallan
    await supabase.from('orders').delete().eq('id', order.id)
    throw new Error('Error agregando productos a la orden')
  }
  
  return order
}

/**
 * Consultar estado de un pedido
 */
export async function getOrderStatus(
  orderNumber: string,
  email: string
): Promise<string | null> {
  const supabase = createAdminClient()
  
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      order_number,
      customer_name,
      status,
      payment_status,
      total,
      created_at,
      shipped_at,
      delivered_at,
      order_items(product_name, quantity, unit_price, total_price),
      shipments(carrier, tracking_number, estimated_delivery_date)
    `)
    .eq('order_number', orderNumber)
    .eq('customer_email', email)
    .single()
  
  if (error || !order) {
    return null
  }
  
  let text = `📦 *Estado de tu Pedido*\n\n`
  text += `📋 Orden: *${order.order_number}*\n`
  text += `👤 Cliente: ${order.customer_name}\n`
  text += `📅 Fecha: ${new Date(order.created_at).toLocaleDateString('es-CO')}\n\n`
  
  text += `📊 *Estado:* ${STATUS_LABELS[order.status] || order.status}\n`
  text += `💳 *Pago:* ${PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}\n\n`
  
  // Items
  text += '🛒 *Productos:*\n'
  const items = (order as any).order_items || []
  items.forEach((item: any) => {
    text += `• ${item.quantity}x ${item.product_name} - $${item.total_price.toLocaleString('es-CO')}\n`
  })
  
  text += `\n💰 *Total: $${order.total.toLocaleString('es-CO')}*\n`
  
  // Info de envío si existe
  const shipments = (order as any).shipments || []
  if (shipments.length > 0) {
    const shipment = shipments[0]
    text += `\n🚚 *Información de Envío:*\n`
    text += `• Transportadora: ${shipment.carrier}\n`
    text += `• # Guía: ${shipment.tracking_number}\n`
    if (shipment.estimated_delivery_date) {
      text += `• Entrega estimada: ${new Date(shipment.estimated_delivery_date).toLocaleDateString('es-CO')}\n`
    }
  }
  
  if (order.shipped_at) {
    text += `\n📬 Enviado el: ${new Date(order.shipped_at).toLocaleDateString('es-CO')}`
  }
  if (order.delivered_at) {
    text += `\n✅ Entregado el: ${new Date(order.delivered_at).toLocaleDateString('es-CO')}`
  }
  
  return text
}
