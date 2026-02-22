/**
 * WhatsApp Cloud API - Client
 * Funciones para enviar mensajes a través de la API de WhatsApp Cloud
 */

const WHATSAPP_API_URL = 'https://graph.facebook.com/v21.0'

function getConfig() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  
  if (!token || !phoneNumberId) {
    throw new Error('WhatsApp API config missing: WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID')
  }
  
  return { token, phoneNumberId }
}

async function sendRequest(endpoint: string, body: any) {
  const { token, phoneNumberId } = getConfig()
  
  const url = `${WHATSAPP_API_URL}/${phoneNumberId}/${endpoint}`
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  
  if (!response.ok) {
    const error = await response.text()
    console.error('❌ WhatsApp API error:', error)
    throw new Error(`WhatsApp API error: ${response.status}`)
  }
  
  return response.json()
}

/** Enviar texto simple */
export async function sendTextMessage(to: string, text: string) {
  return sendRequest('messages', {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text },
  })
}

/** Enviar mensaje con botones (máx. 3 botones) */
export async function sendButtonMessage(
  to: string,
  bodyText: string,
  buttons: { id: string; title: string }[],
  headerText?: string,
  footerText?: string
) {
  const message: any = {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: bodyText },
      action: {
        buttons: buttons.slice(0, 3).map(b => ({
          type: 'reply',
          reply: { id: b.id, title: b.title.slice(0, 20) },
        })),
      },
    },
  }
  
  if (headerText) {
    message.interactive.header = { type: 'text', text: headerText }
  }
  if (footerText) {
    message.interactive.footer = { text: footerText }
  }
  
  return sendRequest('messages', message)
}

/** Enviar lista de opciones (máx. 10 items por sección) */
export async function sendListMessage(
  to: string,
  bodyText: string,
  buttonText: string,
  sections: {
    title: string
    rows: { id: string; title: string; description?: string }[]
  }[],
  headerText?: string,
  footerText?: string
) {
  const message: any = {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'list',
      body: { text: bodyText },
      action: {
        button: buttonText.slice(0, 20),
        sections: sections.map(s => ({
          title: s.title.slice(0, 24),
          rows: s.rows.slice(0, 10).map(r => ({
            id: r.id,
            title: r.title.slice(0, 24),
            description: r.description?.slice(0, 72),
          })),
        })),
      },
    },
  }
  
  if (headerText) {
    message.interactive.header = { type: 'text', text: headerText }
  }
  if (footerText) {
    message.interactive.footer = { text: footerText }
  }
  
  return sendRequest('messages', message)
}

/** Enviar imagen */
export async function sendImageMessage(to: string, imageUrl: string, caption?: string) {
  return sendRequest('messages', {
    messaging_product: 'whatsapp',
    to,
    type: 'image',
    image: {
      link: imageUrl,
      ...(caption && { caption }),
    },
  })
}

/** Enviar documento (PDF) */
export async function sendDocumentMessage(
  to: string,
  documentUrl: string,
  filename: string,
  caption?: string
) {
  return sendRequest('messages', {
    messaging_product: 'whatsapp',
    to,
    type: 'document',
    document: {
      link: documentUrl,
      filename,
      ...(caption && { caption }),
    },
  })
}

/** Marcar mensaje como leído */
export async function markAsRead(messageId: string) {
  return sendRequest('messages', {
    messaging_product: 'whatsapp',
    status: 'read',
    message_id: messageId,
  })
}
