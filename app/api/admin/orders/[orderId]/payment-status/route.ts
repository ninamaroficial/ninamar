import { NextRequest, NextResponse } from 'next/server'
import { updateOrderPaymentStatus } from '@/lib/supabase/admin-orders'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const body = await request.json()
    const { payment_status } = body

    if (!payment_status) {
      return NextResponse.json(
        { error: 'Estado de pago es requerido' },
        { status: 400 }
      )
    }

    if (!['pending', 'approved', 'rejected'].includes(payment_status)) {
      return NextResponse.json(
        { error: 'Estado de pago inválido. Use: pending, approved, rejected' },
        { status: 400 }
      )
    }

    // Actualizar estado de pago
    const order = await updateOrderPaymentStatus(orderId, payment_status)

    console.log('✅ Payment status updated:', {
      orderId,
      newPaymentStatus: payment_status
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating payment status:', error)
    return NextResponse.json(
      { error: 'Error al actualizar estado de pago' },
      { status: 500 }
    )
  }
}
