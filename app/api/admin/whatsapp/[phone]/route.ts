import { NextRequest, NextResponse } from 'next/server'
import { getConversationMessages } from '@/lib/whatsapp/messages'
import { getSession } from '@/lib/whatsapp/session'

/**
 * GET /api/admin/whatsapp/[phone]
 * Obtiene mensajes y datos de sesión de un chat específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  try {
    const { phone } = await params
    
    const [messages, session] = await Promise.all([
      getConversationMessages(phone, 200),
      getSession(phone)
    ])
    
    return NextResponse.json({
      phone,
      messages,
      session: {
        state: session.state,
        mode: session.mode || 'bot',
        cart: session.cart,
        customer_name: session.customer_name,
        customer_email: session.customer_email,
        customer_city: session.customer_city,
        customer_state: session.customer_state,
        last_activity: session.last_activity,
        temp_data: session.temp_data,
      }
    })
  } catch (error) {
    console.error('Error fetching conversation:', error)
    return NextResponse.json(
      { error: 'Error al obtener conversación' },
      { status: 500 }
    )
  }
}
