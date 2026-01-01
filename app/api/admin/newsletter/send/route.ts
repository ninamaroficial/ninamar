import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import CustomNewsletter from '@/emails/templates/CustomNewsletter'
import ProductAnnouncement from '@/emails/templates/ProductAnnouncement'
import SpecialOffer from '@/emails/templates/SpecialOffer'

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
const FROM_EMAIL = process.env.EMAIL_FROM || 'Niña Mar <onboarding@resend.dev>'

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
    } = body

    if (!subject || !content) {
      return NextResponse.json(
        { error: 'Asunto y contenido son requeridos' },
        { status: 400 }
      )
    }

    // Obtener todos los suscriptores activos
    const { data: subscribers, error: fetchError } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('email, name')
      .eq('is_active', true)

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

    const appUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

    // Enviar emails en lotes de 10
    const BATCH_SIZE = 10
    let sent = 0
    let failed = 0

    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE)
      
      const emailPromises = batch.map(async (subscriber) => {
        try {
          const unsubscribeUrl = `${appUrl}/newsletter/unsubscribe?email=${encodeURIComponent(subscriber.email)}`
          
          // Generar HTML según la plantilla seleccionada
          let emailHtml: string

          switch (template) {
            case 'product':
              emailHtml = await render(ProductAnnouncement({ // ← AWAIT AGREGADO
                userName: subscriber.name || 'Amigo/a',
                title: subject,
                description: content,
                products: products || [],
                unsubscribeUrl,
              }))
              break

            case 'offer':
              emailHtml = await render(SpecialOffer({ // ← AWAIT AGREGADO
                userName: subscriber.name || 'Amigo/a',
                offerTitle: subject,
                offerSubtitle: preheader || '',
                discount: discount || '',
                description: content,
                expiryDate: expiryDate || '',
                couponCode: couponCode || '',
                ctaUrl: ctaUrl || `${appUrl}/productos`,
                unsubscribeUrl,
              }))
              break

            case 'custom':
            default:
              emailHtml = await render(CustomNewsletter({ // ← AWAIT AGREGADO
                userName: subscriber.name || 'Amigo/a',
                subject,
                preheader,
                content,
                images: images || [],
                ctaText: ctaText || 'Ver Productos',
                ctaUrl: ctaUrl || `${appUrl}/productos`,
                unsubscribeUrl,
              }))
              break
          }

          const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: subscriber.email,
            subject: subject,
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