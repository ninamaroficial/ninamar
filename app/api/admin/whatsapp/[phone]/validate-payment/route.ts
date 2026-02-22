import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSession, saveSession } from '@/lib/whatsapp/session'
import { sendTextMessage } from '@/lib/whatsapp/client'
import { sendOrderConfirmationEmails } from '@/lib/whatsapp/orders'

// POST /api/admin/whatsapp/[phone]/validate-payment
// Valida el pago manual y envía confirmación
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  try {
    const { phone } = await params
    const session = await getSession(phone)
    const pendingPayment = session.temp_data?.pending_payment

    if (!pendingPayment?.order_id) {
      return NextResponse.json(
        { error: 'No hay pago pendiente para este cliente' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { error: orderError } = await supabase
      .from('orders')
      .update({
        payment_status: 'approved',
        status: 'paid',
      })
      .eq('id', pendingPayment.order_id)

    if (orderError) {
      console.error('Error updating order payment status:', orderError)
      return NextResponse.json(
        { error: 'Error actualizando el estado del pago' },
        { status: 500 }
      )
    }

    // Enviar confirmación por WhatsApp
    await sendTextMessage(
      phone,
      `✅ *Pago validado*\n\nTu pedido *${pendingPayment.order_number}* ha sido confirmado.\n` +
      'En breve comenzaremos la preparación y envío. ¡Gracias por tu compra! 💜'
    )

    // Enviar emails de confirmación (cliente y admin)
    await sendOrderConfirmationEmails(pendingPayment.order_id)

    // Limpiar estado de pago pendiente
    session.state = 'MAIN_MENU'
    session.temp_data = undefined
    await saveSession(session)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error validating payment:', error)
    return NextResponse.json(
      { error: error.message || 'Error al validar pago' },
      { status: 500 }
    )
  }
}
