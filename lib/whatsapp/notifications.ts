/**
 * Notificaciones automáticas de WhatsApp para actualizaciones de órdenes
 */

import { sendTextMessage } from './client'

// Emojis para cada estado
const STATUS_EMOJIS = {
  processing: '⚙️',
  shipped: '📦',
  delivered: '✅',
}

/**
 * Enviar notificación de cambio de estado de orden
 */
export async function sendOrderStatusNotification(
  phone: string,
  customerName: string,
  orderNumber: string,
  status: 'processing' | 'shipped' | 'delivered',
  shipmentData?: {
    carrier: string
    tracking_number: string
  }
) {
  try {
    let message = ''

    switch (status) {
      case 'processing':
        message = `${STATUS_EMOJIS.processing} *¡Hola ${customerName}!*\n\n` +
          `Tu pedido *#${orderNumber}* está en proceso de preparación.\n\n` +
          `Pronto lo tendrás listo para envío. Te avisaremos cuando esté en camino.\n\n` +
          `Gracias por tu confianza en Niñamar 💜`
        break

      case 'shipped':
        message = `${STATUS_EMOJIS.shipped} *¡Tu pedido va en camino!*\n\n` +
          `Hola ${customerName}, tu pedido *#${orderNumber}* ha sido enviado.\n\n` +
          `📮 *Transportadora:* ${shipmentData?.carrier || 'N/A'}\n` +
          `🔢 *Número de guía:* ${shipmentData?.tracking_number || 'N/A'}\n\n` +
          `Puedes rastrear tu pedido con el número de guía. ` +
          `Te avisaremos cuando sea entregado.\n\n` +
          `¡Gracias por comprar en Niñamar! 💜`
        break

      case 'delivered':
        message = `${STATUS_EMOJIS.delivered} *¡Pedido entregado!*\n\n` +
          `Hola ${customerName}, tu pedido *#${orderNumber}* ha sido entregado exitosamente.\n\n` +
          `Esperamos que te encante tu producto artesanal hecho con amor 💜\n\n` +
          `*¿Nos ayudas con tu opinión?*\n` +
          `Tu feedback es muy valioso para nosotros. ` +
          `En un momento te haremos algunas preguntas rápidas sobre tu experiencia.\n\n` +
          `¡Gracias por confiar en Niñamar! ✨`
        break

      default:
        return
    }

    await sendTextMessage(phone, message)
    
    console.log(`✅ WhatsApp notification sent - Order: ${orderNumber}, Status: ${status}`)
  } catch (error) {
    console.error(`❌ Error sending WhatsApp notification for order ${orderNumber}:`, error)
    // No lanzar error para no bloquear el flujo principal
  }
}

/**
 * Enviar encuesta de satisfacción (automático después de "delivered")
 */
export async function sendSatisfactionSurvey(
  phone: string,
  customerName: string,
  orderNumber: string,
  orderId: string
) {
  try {
    // Actualizar sesión para estar lista para recibir encuesta
    const { getSession, saveSession } = await import('./session')
    const session = await getSession(phone)
    
    session.state = 'SURVEY_RATING'
    session.temp_data = {
      survey_order_id: orderId,
      survey_order_number: orderNumber,
    }
    await saveSession(session)
    
    const message = 
      `📊 *Encuesta de Satisfacción*\n\n` +
      `Hola ${customerName}, queremos saber sobre tu experiencia con Niñamar 💜\n\n` +
      `*Por favor califica tu pedido #${orderNumber}:*\n\n` +
      `⭐ Excelente - Escribe *5*\n` +
      `⭐ Muy bueno - Escribe *4*\n` +
      `⭐ Bueno - Escribe *3*\n` +
      `⭐ Regular - Escribe *2*\n` +
      `⭐ Malo - Escribe *1*\n\n` +
      `Solo escribe el número de tu calificación 😊`

    await sendTextMessage(phone, message)
    
    console.log(`✅ Satisfaction survey sent - Order: ${orderNumber}`)
  } catch (error) {
    console.error(`❌ Error sending satisfaction survey for order ${orderNumber}:`, error)
  }
}
