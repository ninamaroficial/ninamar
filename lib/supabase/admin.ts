import { createClient } from '@supabase/supabase-js'

/**
 * Cliente de Supabase con Service Role
 * ⚠️ SOLO usar en el servidor (API routes, webhooks)
 * ⚠️ NUNCA usar en componentes del cliente
 * Bypasea Row Level Security (RLS)
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
  }

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured')
  }

  // Crear cliente con service role que bypasea RLS
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}