import { NextRequest, NextResponse } from 'next/server'
import { sendTextMessage, sendImageMessage } from '@/lib/whatsapp/client'

/**
 * POST /api/admin/whatsapp/[phone]/send
 * Envía un mensaje o imagen manual desde el admin
 * Body: { message?: string, imageUrl?: string, caption?: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  try {
    const { phone } = await params
    const body = await request.json()
    const { message, imageUrl, caption } = body
    
    // Validar que tenga mensaje o imagen
    if (!message && !imageUrl) {
      return NextResponse.json(
        { error: 'Debe enviar un mensaje o una imagen' },
        { status: 400 }
      )
    }

    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()

    // Enviar mensaje de texto
    if (message && typeof message === 'string') {
      await sendTextMessage(phone, message)
      
      // Actualizar el último mensaje para marcarlo como manual (is_bot: false)
      await supabase
        .from('whatsapp_messages')
        .update({ is_bot: false })
        .eq('phone', phone)
        .eq('direction', 'outgoing')
        .eq('content', message)
        .order('timestamp', { ascending: false })
        .limit(1)
    }

    // Enviar imagen
    if (imageUrl && typeof imageUrl === 'string') {
      await sendImageMessage(phone, imageUrl, caption || '')
      
      // Guardar registro de imagen enviada
      const imageCaption = caption || '[Imagen enviada]'
      const timestamp = new Date().toISOString()
      
      await supabase
        .from('whatsapp_messages')
        .insert({
          phone,
          direction: 'outgoing',
          content: imageCaption,
          message_type: 'image',
          is_bot: false,
          timestamp,
          metadata: {
            image_url: imageUrl,
            caption
          }
        })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Error al enviar mensaje' },
      { status: 500 }
    )
  }
}
