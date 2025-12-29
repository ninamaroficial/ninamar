import { NextRequest, NextResponse } from 'next/server'
import { getOrdersList } from '@/lib/supabase/admin-orders'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    const filters = {
      status: searchParams.get('status') || undefined,
      payment_status: searchParams.get('payment_status') || undefined,
      search: searchParams.get('search') || undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0')
    }

    const { orders, total } = await getOrdersList(filters)

    return NextResponse.json({ orders, total })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Error al obtener órdenes' },
      { status: 500 }
    )
  }
}