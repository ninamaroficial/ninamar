import { Resend } from 'resend'
import OrderConfirmationEmail from '@/emails/OrderConfirmation'
import NewOrderAdminEmail from '@/emails/NewOrderAdmin'
import OrderStatusUpdateEmail from '@/emails/OrderStatusUpdate'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.EMAIL_FROM || 'Niña Mar <onboarding@resend.dev>'
const ADMIN_EMAIL = process.env.EMAIL_TO_ADMIN || 'ninamar.oficial@gmail.com'

interface OrderEmailData {
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  items: Array<{
    product_name: string
    quantity: number
    unit_price: number
    total_price: number
    customization_details?: any
  }>
  subtotal: number
  shipping_cost: number
  total: number
  shipping_address: string
  shipping_city: string
  shipping_state: string
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  try {
    console.log('📧 Sending order confirmation email to:', data.customerEmail)
    
    const { data: emailData, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      replyTo: ADMIN_EMAIL,
      subject: `Confirmación de pedido ${data.orderNumber} - Niña Mar`,
      react: OrderConfirmationEmail(data),
      headers: {
        'X-Entity-Ref-ID': data.orderNumber,
        'List-Unsubscribe': `<mailto:${ADMIN_EMAIL}?subject=Cancelar suscripcion>`,
        'Precedence': 'bulk',
      },
    })

    if (error) {
      console.error('❌ Error sending confirmation email:', error)
      throw error
    }

    console.log('✅ Confirmation email sent:', emailData?.id)
    return emailData
  } catch (error) {
    console.error('❌ Failed to send confirmation email:', error)
    throw error
  }
}

export async function sendNewOrderAdminEmail(data: OrderEmailData) {
  try {
    console.log('📧 Sending new order notification to admin')
    
    const { data: emailData, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🔔 Nueva orden: ${data.orderNumber}`,
      react: NewOrderAdminEmail(data),
    })

    if (error) {
      console.error('❌ Error sending admin email:', error)
      throw error
    }

    console.log('✅ Admin email sent:', emailData?.id)
    return emailData
  } catch (error) {
    console.error('❌ Failed to send admin email:', error)
    throw error
  }
}

export async function sendOrderStatusUpdateEmail(
  orderNumber: string,
  customerName: string,
  customerEmail: string,
  status: 'processing' | 'shipped' | 'delivered'
) {
  try {
    console.log(`📧 Sending status update (${status}) email to:`, customerEmail)
    
    const { data: emailData, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `Actualización de tu pedido ${orderNumber} - Niña Mar`,
      react: OrderStatusUpdateEmail({
        orderNumber,
        customerName,
        status,
        trackingUrl: `${process.env.NEXT_PUBLIC_URL}/seguimiento`,
      }),
    })

    if (error) {
      console.error('❌ Error sending status update email:', error)
      throw error
    }

    console.log('✅ Status update email sent:', emailData?.id)
    return emailData
  } catch (error) {
    console.error('❌ Failed to send status update email:', error)
    throw error
  }
}