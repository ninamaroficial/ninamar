import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendNewsletterConfirmation } from '@/lib/email/newsletter'

// Crear cliente admin que ignora RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // ← Service role key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, source } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
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

    // Usar supabaseAdmin en lugar de createClient()
    const { data: existing } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('id, is_active')
      .eq('email', email)
      .single()

    if (existing) {
      if (existing.is_active) {
        return NextResponse.json(
          { error: 'Este email ya está suscrito' },
          { status: 400 }
        )
      } else {
        // Reactivar suscripción
        const { error: updateError } = await supabaseAdmin
          .from('newsletter_subscribers')
          .update({
            is_active: true,
            unsubscribed_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)

        if (updateError) throw updateError

        // Enviar email de confirmación
        try {
          await sendNewsletterConfirmation(email, name)
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError)
        }

        return NextResponse.json({
          message: 'Suscripción reactivada exitosamente'
        })
      }
    }

    // Crear nueva suscripción
    const { data, error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .insert({
        email,
        name: name || null,
        subscribed_from: source || 'footer',
        is_active: true
      })
      .select()
      .single()

    if (error) throw error

    // Enviar email de confirmación
    try {
      await sendNewsletterConfirmation(email, name)
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError)
    }

    console.log('✅ Newsletter subscription created:', data.id)

    return NextResponse.json({
      message: 'Suscripción exitosa. ¡Revisa tu email!',
      subscriber: data
    })
  } catch (error) {
    console.error('Error subscribing to newsletter:', error)
    return NextResponse.json(
      { error: 'Error al suscribirse al newsletter' },
      { status: 500 }
    )
  }
}