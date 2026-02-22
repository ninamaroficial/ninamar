/**
 * WhatsApp Cloud API - Client
 * Funciones para enviar mensajes a través de la API de WhatsApp Cloud
 */

import { saveOutgoingMessage } from './messages'

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
  const result = await sendRequest('messages', {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text },
  })
  
  // Guardar mensaje saliente
  await saveOutgoingMessage(to, text, true, 'text')
  
  return result
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
  
  const result = await sendRequest('messages', message)
  
  // Guardar mensaje saliente
  const buttonTitles = buttons.map(b => b.title).join(', ')
  await saveOutgoingMessage(to, `${bodyText} [Botones: ${buttonTitles}]`, true, 'button')
  
  return result
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
  
  const result = await sendRequest('messages', message)
  
  // Guardar mensaje saliente
  await saveOutgoingMessage(to, `${bodyText} [Lista interactiva]`, true, 'list')
  
  return result
}

/** Enviar imagen */
export async function sendImageMessage(to: string, imageUrl: string, caption?: string) {
  const result = await sendRequest('messages', {
    messaging_product: 'whatsapp',
    to,
    type: 'image',
    image: {
      link: imageUrl,
      ...(caption && { caption }),
    },
  })
  
  // Guardar mensaje saliente
  await saveOutgoingMessage(to, caption || '[Imagen]', true, 'image', { imageUrl })
  
  return result
}

/** Enviar documento (PDF) */
export async function sendDocumentMessage(
  to: string,
  documentUrl: string,
  filename: string,
  caption?: string
) {
  const result = await sendRequest('messages', {
    messaging_product: 'whatsapp',
    to,
    type: 'document',
    document: {
      link: documentUrl,
      filename,
      ...(caption && { caption }),
    },
  })
  
  // Guardar mensaje saliente
  await saveOutgoingMessage(to, caption || `[Documento: ${filename}]`, true, 'document', { documentUrl, filename })
  
  return result
}

/** Marcar mensaje como leído */
export async function markAsRead(messageId: string) {
  return sendRequest('messages', {
    messaging_product: 'whatsapp',
    status: 'read',
    message_id: messageId,
  })
}

/** Obtener la foto de perfil del usuario */
export async function getProfilePictureUrl(phone: string): Promise<string | null> {
  try {
    const { token, phoneNumberId } = getConfig()
    // Endpoint correcto para obtener foto de perfil
    const url = `${WHATSAPP_API_URL}/${phone}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    
    if (!response.ok) {
      console.warn(`⚠️ No se pudo obtener foto de perfil para ${phone} (${response.status})`)
      return null
    }
    
    const data = await response.json()
    // La API retorna la foto en data.profile_picture_url o data.profile?.picture_url
    return data?.profile_picture_url || data?.profile?.picture_url || null
  } catch (error) {
    console.warn('⚠️ Error obteniendo foto de perfil:', error instanceof Error ? error.message : 'Error desconocido')
    return null
  }
}
