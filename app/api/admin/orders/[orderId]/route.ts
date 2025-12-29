import { NextRequest, NextResponse } from 'next/server'
import { getOrderDetails, updateOrderStatus } from '@/lib/supabase/admin-orders'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const { data: order, error } = await getOrderDetails(orderId)

    if (error || !order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Error al obtener orden' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json(
        { error: 'Estado es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el pago esté aprobado antes de actualizar
    const { data: currentOrder, error: fetchError } = await getOrderDetails(orderId)

    if (fetchError || !currentOrder) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    // Validar que el pago esté aprobado
    if (currentOrder.payment_status !== 'approved') {
      return NextResponse.json(
        { 
          error: 'No se puede actualizar el estado. El pago debe estar aprobado primero.',
          payment_status: currentOrder.payment_status 
        },
        { status: 400 }
      )
    }

    const order = await updateOrderStatus(orderId, status)

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Error al actualizar orden' },
      { status: 500 }
    )
  }
}