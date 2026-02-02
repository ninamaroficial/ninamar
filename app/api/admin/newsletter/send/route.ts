import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import NewsletterTemplate from '@/emails/templates/NewsletterTemplate'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = 'Niñamar <no-reply@xn--niamar-xwa.com>'
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      template,
      subject, 
      preheader, 
      content,
      images,
      products,
      discount,
      couponCode,
      expiryDate,
      ctaText,
      ctaUrl,
      recipientType = 'active', // 'all' | 'active' | 'selected'
      selectedRecipients = [], // array de IDs de suscriptores
    } = body

    if (!subject || !content) {
      return NextResponse.json(
        { error: 'Asunto y contenido son requeridos' },
        { status: 400 }
      )
    }

    // Obtener suscriptores según el tipo de destinatario
    let query = supabaseAdmin
      .from('newsletter_subscribers')
      .select('id, email, name, is_active')

    if (recipientType === 'active') {
      query = query.eq('is_active', true)
    } else if (recipientType === 'selected' && selectedRecipients.length > 0) {
      query = query.in('id', selectedRecipients)
    }
    // Si es 'all', no agregamos filtros

    const { data: subscribers, error: fetchError } = await query

    if (fetchError) {
      console.error('Error fetching subscribers:', fetchError)
      throw fetchError
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json(
        { error: 'No hay suscriptores activos' },
        { status: 400 }
      )
    }

    console.log(`📧 Sending newsletter to ${subscribers.length} subscribers`)

    const appUrl = process.env.NEXT_PUBLIC_URL || 'https://niñamar.com'

    // Convertir todas las rutas relativas de imágenes a URLs absolutas
    const contentWithAbsoluteUrls = content.replace(
      /src=["'](\/[^"']+)["']/g,
      `src="${appUrl}$1"`
    )

    console.log('✅ Content with absolute URLs ready')
    console.log('📸 Sample URL:', contentWithAbsoluteUrls.substring(0, 500))

    // Enviar emails en lotes de 10
    const BATCH_SIZE = 10
    let sent = 0
    let failed = 0

    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE)
      
      const emailPromises = batch.map(async (subscriber) => {
        try {
          const unsubscribeUrl = `${appUrl}/newsletter/unsubscribe?email=${encodeURIComponent(subscriber.email)}`
          
          // Usar la nueva plantilla mejorada con URLs absolutas
          const emailHtml = await render(NewsletterTemplate({
            subject,
            preheader,
            content: contentWithAbsoluteUrls, // Usar contenido con URLs absolutas
            ctaText: ctaText || 'Ver Productos',
            ctaUrl: ctaUrl || `${appUrl}/productos`,
            unsubscribeUrl,
            appUrl, // Pasar appUrl para el logo
          }))

          const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: subscriber.email,
            subject: subject,
            replyTo: 'ninamar.oficial@gmail.com',
            headers: {
              'X-Entity-Ref-ID': `newsletter-${Date.now()}`,
              'List-Unsubscribe': `<${unsubscribeUrl}>`,
              'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            },
            html: emailHtml,
          })

          if (error) {
            console.error(`Failed to send to ${subscriber.email}:`, error)
            failed++
            return false
          }

          console.log(`✅ Sent to ${subscriber.email}`)
          sent++
          return true
        } catch (error) {
          console.error(`Error sending to ${subscriber.email}:`, error)
          failed++
          return false
        }
      })

      await Promise.all(emailPromises)

      // Pequeña pausa entre lotes
      if (i + BATCH_SIZE < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    console.log(`📊 Newsletter sent: ${sent} successful, ${failed} failed`)

    return NextResponse.json({
      message: 'Newsletter enviado exitosamente',
      sent,
      failed,
      total: subscribers.length
    })
  } catch (error) {
    console.error('Error sending newsletter:', error)
    return NextResponse.json(
      { error: 'Error al enviar newsletter' },
      { status: 500 }
    )
  }
}