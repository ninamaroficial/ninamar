/**
 * WhatsApp Messages Logger
 * Guarda historial de mensajes para el panel de admin
 */

import { createAdminClient } from '@/lib/supabase/admin'

export async function saveIncomingMessage(
  phone: string,
  messageId: string,
  content: string,
  messageType: 'text' | 'image' | 'document' | 'button' | 'list' = 'text',
  metadata?: any
) {
  const supabase = createAdminClient()

  try {
    await supabase.from('whatsapp_messages').insert({
      phone,
      message_id: messageId,
      direction: 'incoming',
      content,
      message_type: messageType,
      is_bot: false, // Mensajes entrantes son del cliente
      metadata,
    })
  } catch (error) {
    console.error('Error saving incoming message:', error)
  }
}

export async function saveOutgoingMessage(
  phone: string,
  content: string,
  isBot: boolean = true,
  messageType: 'text' | 'image' | 'document' | 'button' | 'list' | 'interactive' = 'text',
  metadata?: any
) {
  const supabase = createAdminClient()

  try {
    await supabase.from('whatsapp_messages').insert({
      phone,
      direction: 'outgoing',
      content,
      message_type: messageType,
      is_bot: isBot,
      metadata,
    })
  } catch (error) {
    console.error('Error saving outgoing message:', error)
  }
}

export async function getConversationMessages(
  phone: string, 
  limit: number = 20,
  offset: number = 0
) {
  const supabase = createAdminClient()

  // Obtener mensajes más recientes primero (DESC), luego revertir
  const { data, error } = await supabase
    .from('whatsapp_messages')
    .select('*')
    .eq('phone', phone)
    .order('timestamp', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }

  // Revertir para mostrar en orden cronológico (más antiguos arriba)
  return (data || []).reverse()
}

// Obtener el total de mensajes de una conversación
export async function getConversationMessageCount(phone: string): Promise<number> {
  const supabase = createAdminClient()

  const { count, error } = await supabase
    .from('whatsapp_messages')
    .select('*', { count: 'exact', head: true })
    .eq('phone', phone)

  if (error) {
    console.error('Error counting messages:', error)
    return 0
  }

  return count || 0
}

export async function getRecentChats(limit: number = 50) {
  const supabase = createAdminClient()

  // Obtener sesiones ordenadas por última actividad
  const { data: sessions, error } = await supabase
    .from('whatsapp_sessions')
    .select('*')
    .order('last_activity', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching sessions:', error)
    return []
  }

  // Para cada sesión, obtener el último mensaje
  const chatsWithLastMessage = await Promise.all(
    sessions.map(async (session) => {
      const { data: lastMessage } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('phone', session.phone)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single()

      return {
        phone: session.phone,
        customer_name: session.session_data?.customer_name || 'Cliente',
        state: session.state,
        mode: session.mode || 'bot',
        cart_items: session.cart?.length || 0,
        last_activity: session.last_activity,
        last_message: lastMessage?.content || 'Sin mensajes',
        last_message_time: lastMessage?.timestamp || session.last_activity,
        unread: false, // TODO: implementar conteo de no leídos
        profile_picture_url: session.session_data?.profile_picture_url,
      }
    })
  )

  return chatsWithLastMessage
}
