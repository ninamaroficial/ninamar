/**
 * WhatsApp Bot - Session Manager
 * Gestiona el estado de conversación de cada usuario usando Supabase
 */

import { createAdminClient } from '@/lib/supabase/admin'

export interface CartItem {
  product_id: string
  product_name: string
  product_slug: string
  product_image?: string
  price: number
  quantity: number
}

export interface ConversationSession {
  phone: string
  state: string           // Estado actual del flujo
  cart: CartItem[]         // Productos en el carrito
  customer_name?: string
  customer_email?: string
  customer_document?: string
  customer_address?: string
  customer_city?: string
  customer_state?: string
  temp_data?: any          // Datos temporales durante un flujo
  last_activity: string
}

const DEFAULT_SESSION: Omit<ConversationSession, 'phone' | 'last_activity'> = {
  state: 'MAIN_MENU',
  cart: [],
}

/**
 * Obtener o crear sesión para un número de teléfono.
 * Usa la tabla `whatsapp_sessions` en Supabase.
 */
export async function getSession(phone: string): Promise<ConversationSession> {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('whatsapp_sessions')
    .select('*')
    .eq('phone', phone)
    .single()
  
  if (error || !data) {
    // Crear nueva sesión
    const newSession: ConversationSession = {
      ...DEFAULT_SESSION,
      phone,
      last_activity: new Date().toISOString(),
    }
    
    await supabase
      .from('whatsapp_sessions')
      .upsert({
        phone,
        state: newSession.state,
        cart: newSession.cart,
        session_data: {},
        last_activity: newSession.last_activity,
      })
    
    return newSession
  }
  
  // Verificar si la sesión expiró (30 min de inactividad → reset)
  const lastActivity = new Date(data.last_activity)
  const now = new Date()
  const minutesSinceLastActivity = (now.getTime() - lastActivity.getTime()) / 1000 / 60
  
  if (minutesSinceLastActivity > 30) {
    const resetSession: ConversationSession = {
      ...DEFAULT_SESSION,
      phone,
      customer_name: data.session_data?.customer_name,
      customer_email: data.session_data?.customer_email,
      customer_phone: data.session_data?.customer_phone,
      last_activity: now.toISOString(),
    } as any
    
    await saveSession(resetSession)
    return resetSession
  }
  
  return {
    phone: data.phone,
    state: data.state,
    cart: data.cart || [],
    customer_name: data.session_data?.customer_name,
    customer_email: data.session_data?.customer_email,
    customer_document: data.session_data?.customer_document,
    customer_address: data.session_data?.customer_address,
    customer_city: data.session_data?.customer_city,
    customer_state: data.session_data?.customer_state,
    temp_data: data.session_data?.temp_data,
    last_activity: data.last_activity,
  }
}

export async function saveSession(session: ConversationSession) {
  const supabase = createAdminClient()
  
  await supabase
    .from('whatsapp_sessions')
    .upsert({
      phone: session.phone,
      state: session.state,
      cart: session.cart,
      session_data: {
        customer_name: session.customer_name,
        customer_email: session.customer_email,
        customer_document: session.customer_document,
        customer_address: session.customer_address,
        customer_city: session.customer_city,
        customer_state: session.customer_state,
        temp_data: session.temp_data,
      },
      last_activity: new Date().toISOString(),
    })
}

export async function clearCart(phone: string) {
  const session = await getSession(phone)
  session.cart = []
  session.state = 'MAIN_MENU'
  await saveSession(session)
}
