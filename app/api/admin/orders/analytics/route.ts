import { NextResponse } from 'next/server'
import { getOrdersAnalytics } from '@/lib/supabase/admin-orders'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const analytics = await getOrdersAnalytics()
    return NextResponse.json(analytics, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    })
  } catch (error) {
    console.error('Error fetching order analytics:', error)
    return NextResponse.json(
      { error: 'Error al obtener analítica de pedidos' },
      { status: 500 }
    )
  }
}
