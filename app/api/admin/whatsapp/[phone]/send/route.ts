import { NextRequest, NextResponse } from 'next/server'
import { sendTextMessage } from '@/lib/whatsapp/client'

/**
 * POST /api/admin/whatsapp/[phone]/send
 * Envía un mensaje manual desde el admin
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  try {
    const { phone } = await params
    const { message } = await request.json()
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mensaje inválido' },
        { status: 400 }
      )
    }
    
    // Enviar mensaje por WhatsApp API
    // La función sendTextMessage ya guarda el mensaje con is_bot: true
    // Necesitamos actualizar ese registro después
    await sendTextMessage(phone, message)
    
    // Actualizar el último mensaje para marcarlo como manual (is_bot: false)
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()
    
    await supabase
      .from('whatsapp_messages')
      .update({ is_bot: false })
      .eq('phone', phone)
      .eq('direction', 'outgoing')
      .eq('content', message)
      .order('timestamp', { ascending: false })
      .limit(1)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending manual message:', error)
    return NextResponse.json(
      { error: 'Error al enviar mensaje' },
      { status: 500 }
    )
  }
}
