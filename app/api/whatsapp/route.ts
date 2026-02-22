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

// Cache simple para deduplicar mensajes (evita procesar el mismo mensaje 2 veces)
const processedMessages = new Set<string>()
const MAX_CACHE_SIZE = 500

function isProcessed(messageId: string): boolean {
  if (processedMessages.has(messageId)) return true
  if (processedMessages.size >= MAX_CACHE_SIZE) {
    // Limpiar los más viejos (convertir a array, quitar la mitad)
    const arr = Array.from(processedMessages)
    arr.slice(0, MAX_CACHE_SIZE / 2).forEach(id => processedMessages.delete(id))
  }
  processedMessages.add(messageId)
  return false
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar estructura del webhook
    if (!body.object || body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ error: 'Invalid webhook' }, { status: 400 })
    }
    
    const entries = body.entry || []
    
    for (const entry of entries) {
      const changes = entry.changes || []
      
      for (const change of changes) {
        if (change.field !== 'messages') continue
        
        const value = change.value
        const messages = value.messages || []
        const contacts = value.contacts || []
        
        // Ignorar si solo hay statuses (no son mensajes reales)
        if (messages.length === 0) continue
        
        for (let i = 0; i < messages.length; i++) {
          const message = messages[i]
          const contact = contacts[i] || contacts[0]
          
          // Deduplicar: no procesar el mismo mensaje dos veces
          if (isProcessed(message.id)) {
            console.log(`⏭️ Mensaje duplicado ignorado: ${message.id}`)
            continue
          }
          
          // Guardar mensaje entrante en base de datos
          const phone = message.from
          const messageText = message.text?.body || message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || '[Mensaje no texto]'
          const messageType = message.type || 'text'
          
          const { saveIncomingMessage } = await import('@/lib/whatsapp/messages')
          await saveIncomingMessage(phone, message.id, messageText, messageType as any, { contact })
          
          // Importar dinámicamente para evitar problemas de carga circular
          const { handleIncomingMessage } = await import('@/lib/whatsapp/handler')
          
          // Procesar mensaje y ESPERAR a que termine (evita race conditions)
          try {
            await handleIncomingMessage(message, contact, value.metadata)
          } catch (err) {
            console.error('❌ Error processing WhatsApp message:', err)
          }
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
