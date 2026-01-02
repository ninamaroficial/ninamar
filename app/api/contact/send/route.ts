import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.EMAIL_FROM || 'Niña Mar <onboarding@resend.dev>'
const ADMIN_EMAIL = process.env.EMAIL_TO_ADMIN || 'ninamar.oficial@gmail.com'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message } = body

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Email para el admin
    const { data: adminEmail, error: adminError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      replyTo: email,
      subject: `Nuevo mensaje de contacto: ${subject || 'Sin asunto'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Nuevo mensaje de contacto</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #a6e8e4, #8dd4cf); padding: 30px; border-radius: 10px 10px 0 0;">
              <h1 style="color: #0f172a; margin: 0;">Nuevo Mensaje de Contacto</h1>
            </div>
            
            <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #0f172a; margin-top: 0;">Información del Contacto</h2>
              
              <table style="width: 100%; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                    <strong>Nombre:</strong>
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                    ${name}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                    <strong>Email:</strong>
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                    <a href="mailto:${email}" style="color: #0f766e;">${email}</a>
                  </td>
                </tr>
                ${phone ? `
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                    <strong>Teléfono:</strong>
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                    ${phone}
                  </td>
                </tr>
                ` : ''}
                ${subject ? `
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                    <strong>Asunto:</strong>
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                    ${subject}
                  </td>
                </tr>
                ` : ''}
              </table>
              
              <h3 style="color: #0f172a; margin-top: 30px;">Mensaje</h3>
              <div style="background: #ffffff; padding: 20px; border-radius: 8px; border-left: 4px solid #a6e8e4;">
                ${message.replace(/\n/g, '<br>')}
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 14px; margin: 0;">
                  Este mensaje fue enviado desde el formulario de contacto de Niñamar
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (adminError) {
      console.error('Error sending admin email:', adminError)
      throw adminError
    }

    // Email de confirmación al usuario
    const { data: userEmail, error: userError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Hemos recibido tu mensaje - Niñamar',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Mensaje recibido</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #a6e8e4, #8dd4cf); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: #0f172a; margin: 0;">Niñamar</h1>
              <p style="color: #0f172a; margin: 10px 0 0;">Accesorios Personalizados</p>
            </div>
            
            <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #0f172a;">¡Hola ${name}!</h2>
              
              <p style="color: #475569; font-size: 16px;">
                Gracias por contactarnos. Hemos recibido tu mensaje y te responderemos lo antes posible.
              </p>
              
              <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #a6e8e4;">
                <p style="margin: 0; color: #64748b; font-size: 14px;"><strong>Tu mensaje:</strong></p>
                <p style="color: #475569; margin: 10px 0 0;">
                  ${message.replace(/\n/g, '<br>')}
                </p>
              </div>
              
              <p style="color: #475569; font-size: 16px;">
                Mientras tanto, puedes explorar nuestra colección de accesorios personalizados.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_URL || 'https://ninamar.com'}/productos" 
                   style="display: inline-block; background: linear-gradient(135deg, #a6e8e4, #8dd4cf); 
                          color: #0f172a; padding: 15px 40px; text-decoration: none; 
                          border-radius: 50px; font-weight: 600;">
                  Ver Productos
                </a>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
                <p style="color: #94a3b8; font-size: 14px; margin: 0;">
                  Síguenos en redes sociales
                </p>
                <p style="margin: 10px 0;">
                  <a href="https://www.instagram.com/ninamar_oficial" style="color: #a6e8e4; text-decoration: none; margin: 0 10px;">Instagram</a>
                  <a href="https://www.facebook.com/profile.php?id=61585522993204" style="color: #a6e8e4; text-decoration: none; margin: 0 10px;">Facebook</a>
                </p>
                <p style="color: #94a3b8; font-size: 12px; margin: 10px 0 0;">
                  © ${new Date().getFullYear()} Niñamar. Popayán, Cauca, Colombia
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (userError) {
      console.error('Error sending user confirmation:', userError)
      // No fallar si el email de confirmación falla
    }

    console.log('✅ Contact form emails sent successfully')

    return NextResponse.json({
      message: 'Mensaje enviado exitosamente',
      adminEmailId: adminEmail?.id,
      userEmailId: userEmail?.id,
    })
  } catch (error) {
    console.error('Error sending contact emails:', error)
    return NextResponse.json(
      { error: 'Error al enviar el mensaje' },
      { status: 500 }
    )
  }
}