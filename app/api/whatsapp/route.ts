import { NextRequest, NextResponse } from 'next/server'

/**
 * WhatsApp Webhook Verification (GET)
 * Meta envía un GET para verificar el webhook cuando lo configuras
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')
  
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN
  
  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ WhatsApp webhook verified')
    return new NextResponse(challenge, { status: 200 })
  }
  
  console.error('❌ WhatsApp webhook verification failed')
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

/**
 * WhatsApp Webhook Messages (POST)
 * Meta envía un POST con cada mensaje recibido
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar estructura del webhook
    if (!body.object || body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ error: 'Invalid webhook' }, { status: 400 })
    }
    
    // Procesar en background para responder rápido a Meta (requiere <5s)
    const entries = body.entry || []
    
    for (const entry of entries) {
      const changes = entry.changes || []
      
      for (const change of changes) {
        if (change.field !== 'messages') continue
        
        const value = change.value
        const messages = value.messages || []
        const contacts = value.contacts || []
        
        for (let i = 0; i < messages.length; i++) {
          const message = messages[i]
          const contact = contacts[i] || contacts[0]
          
          // Importar dinámicamente para evitar problemas de carga circular
          const { handleIncomingMessage } = await import('@/lib/whatsapp/handler')
          
          // Procesar mensaje sin bloquear la respuesta
          handleIncomingMessage(message, contact, value.metadata).catch((err: Error) => {
            console.error('❌ Error processing WhatsApp message:', err)
          })
        }
      }
    }
    
    // Siempre responder 200 a Meta
    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('❌ WhatsApp webhook error:', error)
    // Aún así responder 200 para evitar reintentos
    return NextResponse.json({ status: 'ok' })
  }
}
