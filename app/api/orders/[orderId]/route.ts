import { NextRequest, NextResponse } from 'next/server'
import { getOrder } from '@/lib/supabase/orders'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'ID de orden no proporcionado' },
        { status: 400 }
      )
    }

    const order = await getOrder(orderId)

    if (!order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Error al obtener la orden' },
      { status: 500 }
    )
  }
}