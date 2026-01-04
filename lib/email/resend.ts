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
  newStatus: 'processing' | 'shipped' | 'delivered',
  shipmentData?: {
    carrier: string
    tracking_number: string
    estimated_delivery_date?: string
  }
) {
  const statusMessages = {
    processing: {
      subject: 'Tu pedido está siendo preparado',
      title: '¡Estamos preparando tu pedido!',
      message: 'Hemos comenzado a trabajar en tu pedido. Te notificaremos cuando sea enviado.',
    },
    shipped: {
      subject: 'Tu pedido ha sido enviado',
      title: '¡Tu pedido va en camino!',
      message: shipmentData
        ? `Tu pedido ha sido enviado con ${shipmentData.carrier}. Número de seguimiento: ${shipmentData.tracking_number}`
        : 'Tu pedido ha sido enviado y está en camino.',
    },
    delivered: {
      subject: 'Tu pedido ha sido entregado',
      title: '¡Tu pedido ha llegado!',
      message: 'Tu pedido ha sido entregado exitosamente. ¡Esperamos que lo disfrutes!',
    },
  }

  const statusInfo = statusMessages[newStatus]

  try {
    await resend.emails.send({
      from: '💎 Niñamar <pedidos@xn--niamar-xwa.com>',
      to: customerEmail,
      subject: `${statusInfo.subject} - Pedido #${orderNumber}`,
      html: `
      <!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${statusInfo.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: linear-gradient(135deg, #f8fafa 0%, #e8f4f3 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f8fafa 0%, #e8f4f3 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
          
          <!-- HEADER con gradiente y patrón -->
          <tr>
            <td style="background: linear-gradient(135deg, #a6e8e4 0%, #8dd4cf 50%, #6ec1bc 100%); padding: 50px 30px; position: relative;">
              <!-- Patrón decorativo -->
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E'); opacity: 0.3;"></div>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="position: relative; z-index: 1;">
                <tr>
                  <td align="center">
                    <!-- Logo -->
                    <div style="background: white; border-radius: 20px; padding: 15px; display: inline-block; box-shadow: 0 8px 20px rgba(0,0,0,0.15); margin-bottom: 25px;">
                      <img src="https://niñamar.com/logo.png"
                           alt="Niñamar"
                           width="70"
                           style="display: block; border: 0; outline: none;">
                    </div>
                    
                    
                    <!-- Título -->
                    <h1 style="margin: 0 0 10px; font-family: Helvetica, 'Times New Roman', serif; font-size: 36px; color: #ffffff; font-weight: 400; text-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                      ${statusInfo.title}
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding: 50px 40px;">
              
              <p style="margin: 0 0 20px; color: #0f172a; font-size: 18px; font-weight: 600;">
                Hola ${customerName},
              </p>
              
              <p style="margin: 0 0 30px; color: #475569; font-size: 16px; line-height: 1.7;">
                ${statusInfo.message}
              </p>

              <!-- Número de pedido destacado -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px 0;">
                <tr>
                  <td style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); border-radius: 12px; padding: 20px; border-left: 4px solid #a6e8e4;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="40" style="vertical-align: middle;">
                          <div style="font-size: 28px;">📦</div>
                        </td>
                        <td style="vertical-align: middle;">
                          <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            Pedido
                          </p>
                          <p style="margin: 4px 0 0; color: #0f172a; font-size: 20px; font-weight: 700; font-family: 'Courier New', monospace;">
                            #${orderNumber}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- SHIPPING INFO (si existe) -->
              ${shipmentData ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px 0;">
                <tr>
                  <td style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(59, 130, 246, 0.05)); border: 2px solid #8b5cf6; border-radius: 16px; padding: 30px;">
                    
                    <!-- Header de envío -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                      <tr>
                        <td>
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="40" style="vertical-align: middle;">
                                <div style="font-size: 32px;">🚚</div>
                              </td>
                              <td style="vertical-align: middle;">
                                <h3 style="margin: 0; color: #0f172a; font-size: 20px; font-weight: 700;">
                                  Información de Envío
                                </h3>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Detalles de envío -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid rgba(139, 92, 246, 0.1);">
                          <p style="margin: 0 0 4px; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            Transportadora
                          </p>
                          <p style="margin: 0; color: #0f172a; font-size: 16px; font-weight: 600;">
                            ${shipmentData.carrier}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid rgba(139, 92, 246, 0.1);">
                          <p style="margin: 0 0 4px; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            Número de Guía
                          </p>
                          <p style="margin: 0; color: #8b5cf6; font-size: 18px; font-weight: 700; font-family: 'Courier New', monospace;">
                            ${shipmentData.tracking_number}
                          </p>
                        </td>
                      </tr>
                      ${shipmentData.estimated_delivery_date ? `
                      <tr>
                        <td style="padding: 12px 0;">
                          <p style="margin: 0 0 4px; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            Entrega Estimada
                          </p>
                          <p style="margin: 0; color: #0f172a; font-size: 16px; font-weight: 600;">
                            📅 ${new Date(shipmentData.estimated_delivery_date).toLocaleDateString('es-CO', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </td>
                      </tr>
                      ` : ''}
                    </table>

                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Separador decorativo -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 40px 0;">
                <tr>
                  <td align="center">
                    <div style="width: 60px; height: 4px; background: linear-gradient(90deg, #a6e8e4, #8dd4cf); border-radius: 2px;"></div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background: linear-gradient(135deg, #a6e8e4, #8dd4cf); border-radius: 50px; box-shadow: 0 8px 20px rgba(166, 232, 228, 0.4);">
                          <a href="${process.env.NEXT_PUBLIC_URL}/seguimiento?order=${orderNumber}" 
                             style="display: block; color: #0f172a; text-decoration: none; padding: 18px 50px; font-weight: 700; font-size: 17px; letter-spacing: 0.5px;">
                            🔍 Rastrear Pedido
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Mensaje de ayuda -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 40px 0 0 0;">
                <tr>
                  <td style="background: #fef3c7; border-left: 4px solid #fbbf24; border-radius: 8px; padding: 16px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                      💡 <strong>¿Necesitas ayuda?</strong><br>
                      Estamos aquí para ti. Contáctanos en cualquier momento.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 30px;">
              
              <!-- Redes sociales -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 20px; color: #cbd5e1; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                      Síguenos
                    </p>
                    <table cellpadding="0" cellspacing="0" style="display: inline-block;">
                      <tr>
                        <!-- Instagram -->
    <td align="center">
      <table cellpadding="0" cellspacing="0" style="display: inline-block;">
        <tr>
          <!-- Instagram -->
          <td style="padding: 0 8px;">
            <a href="https://www.instagram.com/ninamar_oficial" style="display: inline-block; text-decoration: none;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: rgba(255,255,255,0.1); border-radius: 50%; padding: 10px;">
                    <img src="https://xxzksnruxbaqemtebgln.supabase.co/storage/v1/object/public/public_images/instagram-icon.png" alt="Instagram" width="24" height="24" style="display: block; border: 0;">
                  </td>
                </tr>
              </table>
            </a>
          </td>
                        
          <!-- Facebook -->
          <td style="padding: 0 8px;">
            <a href="https://www.facebook.com/profile.php?id=61585522993204" style="display: inline-block; text-decoration: none;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: rgba(255,255,255,0.1); border-radius: 50%; padding: 10px;">
                    <img src="https://xxzksnruxbaqemtebgln.supabase.co/storage/v1/object/public/public_images/facebook-icon.png" alt="Facebook" width="24" height="24" style="display: block; border: 0;">
                  </td>
                </tr>
              </table>
            </a>
          </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Info de contacto -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 5px; color: #94a3b8; font-size: 13px;">
                      📧 ninamar.oficial@gmail.com
                    </p>
                    <p style="margin: 0 0 5px; color: #94a3b8; font-size: 13px;">
                      📍 Popayán, Cauca, Colombia
                    </p>
                    <p style="margin: 20px 0 0; color: #64748b; font-size: 12px;">
                      © ${new Date().getFullYear()} Niñamar. Todos los derechos reservados.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>

      `,
    })

    console.log(`✅ Status update email sent to ${customerEmail}`)
  } catch (error) {
    console.error('Error sending status update email:', error)
    throw error
  }
}