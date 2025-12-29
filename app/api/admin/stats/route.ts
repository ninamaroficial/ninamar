import { NextResponse } from 'next/server'
import { getOrderStats } from '@/lib/supabase/admin-orders'

export async function GET() {
  try {
    const stats = await getOrderStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}