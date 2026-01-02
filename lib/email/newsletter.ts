import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.EMAIL_FROM || 'Niña Mar <onboarding@resend.dev>'
const ADMIN_EMAIL = process.env.EMAIL_TO_ADMIN || 'ninamar.oficial@gmail.com'

export async function sendNewsletterConfirmation(
  email: string,
  name?: string
) {
  const displayName = name || 'Amigo/a'
  const appUrl = process.env.NEXT_PUBLIC_URL || 'http://niñamar.com'

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      replyTo: ADMIN_EMAIL, // ← AGREGADO: permite responder
      subject: '¡Bienvenido/a a Niñamar! ✨',
      headers: {
        'X-Entity-Ref-ID': `newsletter-${Date.now()}`,
        'List-Unsubscribe': `<${appUrl}/newsletter/unsubscribe?email=${encodeURIComponent(email)}>`, // ← AGREGADO
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click', // ← AGREGADO
        'Precedence': 'bulk', // ← AGREGADO
      },
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bienvenido a Niñamar</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafa;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafa; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                  
                  <!-- Header con degradado -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #a6e8e4 0%, #8dd4cf 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="margin: 0; color: #0f172a; font-size: 32px; font-weight: 400; letter-spacing: 0.5px;">
                        Niñamar
                      </h1>
                      <p style="margin: 10px 0 0; color: #0f172a; font-size: 16px;">
                        accesorios Personalizadas
                      </p>
                    </td>
                  </tr>

                  <!-- Contenido -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px; color: #0f172a; font-size: 24px; font-weight: 400;">
                        ¡Hola ${displayName}! ✨
                      </h2>
                      
                      <p style="margin: 0 0 16px; color: #64748b; font-size: 16px; line-height: 1.6;">
                        Gracias por suscribirte a nuestro newsletter. Estamos emocionados de tenerte en nuestra comunidad.
                      </p>

                      <p style="margin: 0 0 16px; color: #64748b; font-size: 16px; line-height: 1.6;">
                        Serás el primero en enterarte de:
                      </p>

                      <ul style="margin: 0 0 24px; padding-left: 20px; color: #64748b; font-size: 16px; line-height: 1.8;">
                        <li>Nuevas colecciones y diseños exclusivos</li>
                        <li>Ofertas especiales y descuentos</li>
                        <li>Tips de cuidado para tus accesorios</li>
                        <li>Historias detrás de nuestras creaciones</li>
                      </ul>

                      <p style="margin: 0 0 24px; color: #64748b; font-size: 16px; line-height: 1.6;">
                        Mientras tanto, ¿por qué no echas un vistazo a nuestra colección?
                      </p>

                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center">
                            <a href="${appUrl}/productos" style="display: inline-block; background: linear-gradient(135deg, #a6e8e4, #8dd4cf); color: #0f172a; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 600; font-size: 16px;">
                              Ver Productos
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0 0 10px; color: #94a3b8; font-size: 14px;">
                        Síguenos en redes sociales
                      </p>
                      <p style="margin: 0 0 16px;">
                        <a href="https://www.instagram.com/ninamar_oficial" style="display: inline-block; margin: 0 8px; color: #a6e8e4; text-decoration: none; font-size: 14px;">Instagram</a>
                        <a href="https://www.facebook.com/profile.php?id=61585522993204" style="display: inline-block; margin: 0 8px; color: #a6e8e4; text-decoration: none; font-size: 14px;">Facebook</a>
                      </p>
                      <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                        © ${new Date().getFullYear()} Niñamar. Popayán, Cauca, Colombia
                      </p>
                      <p style="margin: 8px 0 0; color: #94a3b8; font-size: 12px;">
                        <a href="${appUrl}/newsletter/unsubscribe?email=${encodeURIComponent(email)}" style="color: #94a3b8; text-decoration: underline;">
                          Cancelar suscripción
                        </a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    })

    if (error) {
      console.error('Resend error:', error)
      throw error
    }

    console.log('✅ Newsletter confirmation email sent:', data?.id)
    return data
  } catch (error) {
    console.error('Error sending newsletter confirmation:', error)
    throw error
  }
}