import { NextResponse } from 'next/server'
import { getRecentChats } from '@/lib/whatsapp/messages'

/**
 * GET /api/admin/whatsapp
 * Lista todos los chats recientes
 */
export async function GET() {
  try {
    const chats = await getRecentChats(100)
    
    return NextResponse.json(chats)
  } catch (error) {
    console.error('Error fetching WhatsApp chats:', error)
    return NextResponse.json(
      { error: 'Error al obtener chats' },
      { status: 500 }
    )
  }
}
