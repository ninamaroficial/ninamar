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
  <title>Bienvenido a Niñamar!</title>
</head>

<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: linear-gradient(135deg, #f8fafa 0%, #e8f4f3 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f8fafa 0%, #e8f4f3 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
          
          <!-- HEADER con gradiente -->
          <tr>
            <td style="background: linear-gradient(135deg, #a6e8e4 0%, #8dd4cf 50%, #6ec1bc 100%); padding: 50px 30px; position: relative;">
              <!-- Patrón decorativo -->
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E'); opacity: 0.3;"></div>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="position: relative; z-index: 1;">
                <tr>
                  <td align="center">
                    <!-- Logo con sombra -->
                    <div style="background: white; border-radius: 20px; padding: 15px; display: inline-block; box-shadow: 0 8px 20px rgba(0,0,0,0.15); margin-bottom: 20px;">
                      <img src="https://niñamar.com/logo.png"
                           alt="Niñamar"
                           width="80"
                           style="display: block; border: 0; outline: none;">
                    </div>
                    
                    <!-- Título -->
                    <h1 style="margin: 0 0 10px; font-family: Helvetica, 'Times New Roman', serif; font-size: 36px; color: #ffffff; font-weight: 400; text-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                      Niñamar
                    </h1>
                    <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: rgba(255,255,255,0.95); letter-spacing: 2px; text-transform: uppercase; font-weight: 600;">
                      Accesorios Personalizados
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CONTENIDO -->
          <tr>
            <td style="padding: 50px 40px;">

              <h2 style="margin: 0 0 20px; color: #0f172a; font-size: 28px; font-weight: 600; text-align: center;">
                ¡Bienvenid@ ${displayName}!
              </h2>
              
              <p style="margin: 0 0 24px; color: #64748b; font-size: 17px; line-height: 1.7; text-align: center;">
                Nos emociona tenerte en nuestra comunidad de amantes de los accesorios únicos
              </p>

              <!-- Tarjetas de beneficios -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td style="padding: 0 0 15px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); border-radius: 12px; border-left: 4px solid #a6e8e4;">
                      <tr>
                        <td style="padding: 20px;">
                          <div style="font-size: 24px; margin-bottom: 8px;">🎨</div>
                          <strong style="color: #0f172a; font-size: 16px; display: block; margin-bottom: 6px;">Diseños Exclusivos</strong>
                          <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.5;">
                            Nuevas colecciones antes que nadie
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 0 0 15px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); border-radius: 12px; border-left: 4px solid #8dd4cf;">
                      <tr>
                        <td style="padding: 20px;">
                          <div style="font-size: 24px; margin-bottom: 8px;">🎁</div>
                          <strong style="color: #0f172a; font-size: 16px; display: block; margin-bottom: 6px;">Ofertas Especiales</strong>
                          <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.5;">
                            Descuentos y promociones exclusivas
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 0 0 15px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); border-radius: 12px; border-left: 4px solid #6ec1bc;">
                      <tr>
                        <td style="padding: 20px;">
                          <div style="font-size: 24px; margin-bottom: 8px;">💡</div>
                          <strong style="color: #0f172a; font-size: 16px; display: block; margin-bottom: 6px;">Tips & Cuidados</strong>
                          <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.5;">
                            Consejos para cuidar tus accesorios
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Separador decorativo -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 40px 0;">
                <tr>
                  <td align="center">
                    <div style="width: 60px; height: 4px; background: linear-gradient(90deg, #a6e8e4, #8dd4cf); border-radius: 2px;"></div>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 30px; color: #475569; font-size: 17px; line-height: 1.6; text-align: center;">
                ¿Lista para descubrir piezas únicas que cuentan tu historia?
              </p>

              <!-- Botón CTA mejorado -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background: linear-gradient(135deg, #a6e8e4, #8dd4cf); border-radius: 50px; box-shadow: 0 8px 20px rgba(166, 232, 228, 0.4);">
                          <a href="${appUrl}/productos" style="display: block; color: #0f172a; text-decoration: none; padding: 18px 50px; font-weight: 700; font-size: 17px; letter-spacing: 0.5px;">
                            ✨ Explorar Colección
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Mensaje adicional -->
              <p style="margin: 30px 0 0; color: #94a3b8; font-size: 14px; line-height: 1.6; text-align: center; font-style: italic;">
                "Cada pieza es una obra de arte hecha con amor y dedicación"
              </p>
            </td>
          </tr>

          <tr>
  <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 30px;">
    <!-- Redes sociales con logos SVG -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
      <tr>
        <td align="center">
          <p style="margin: 0 0 20px; color: #cbd5e1; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
            Síguenos
          </p>
          <!-- Redes sociales con imágenes -->
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
  <tr>
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

    <!-- Separador -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
      <tr>
        <td align="center">
          <div style="width: 100%; height: 1px; background: rgba(255,255,255,0.1);"></div>
        </td>
      </tr>
    </table>

    <!-- Link de cancelar suscripción -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${appUrl}/newsletter/unsubscribe?email=${encodeURIComponent(email)}" style="color: #64748b; text-decoration: none; font-size: 12px;">
            Cancelar suscripción
          </a>
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