import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth/admin'
import { sendOrderSatisfactionSurveyEmail } from '@/lib/email/resend'
import { getOrderDetails } from '@/lib/supabase/admin-orders'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const token = request.cookies.get('admin_token')?.value

    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { orderId } = await params
    const { data: order, error } = await getOrderDetails(orderId)

    if (error || !order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    if (order.status !== 'delivered') {
      return NextResponse.json(
        { error: 'La encuesta solo se puede enviar cuando la orden esté entregada' },
        { status: 400 }
      )
    }

    if (!order.customer_email) {
      return NextResponse.json(
        { error: 'La orden no tiene correo del cliente' },
        { status: 400 }
      )
    }

    await sendOrderSatisfactionSurveyEmail({
      orderId: order.id,
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending order survey:', error)
    return NextResponse.json(
      { error: 'No se pudo enviar la encuesta' },
      { status: 500 }
    )
  }
}