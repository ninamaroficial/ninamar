import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * PATCH /api/admin/whatsapp/[phone]/mode
 * Cambia el modo de la sesión (bot/manual)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  try {
    const { phone } = await params
    const { mode } = await request.json()
    
    if (!mode || !['bot', 'manual'].includes(mode)) {
      return NextResponse.json(
        { error: 'Modo inválido. Use: bot o manual' },
        { status: 400 }
      )
    }
    
    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from('whatsapp_sessions')
      .update({ mode })
      .eq('phone', phone)
    
    if (error) {
      console.error('Supabase error updating mode:', error)
      throw new Error(`Database error: ${error.message}`)
    }
    
    return NextResponse.json({ success: true, mode })
  } catch (error: any) {
    console.error('Error updating session mode:', error)
    return NextResponse.json(
      { error: error.message || 'Error al cambiar modo' },
      { status: 500 }
    )
  }
}
