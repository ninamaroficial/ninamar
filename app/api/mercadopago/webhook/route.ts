import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { updateOrderPaymentStatus } from '@/lib/supabase/orders'

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!
})

const payment = new Payment(client)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Webhook received:', body)

    // MercadoPago envía notificaciones de tipo "payment"
    if (body.type === 'payment') {
      const paymentId = body.data.id

      // Obtener información completa del pago
      const paymentInfo = await payment.get({ id: paymentId })

      console.log('Payment info:', paymentInfo)

      const orderId = paymentInfo.external_reference
      const status = paymentInfo.status
      const paymentMethod = paymentInfo.payment_method_id

      // Actualizar estado de la orden
      if (status === 'approved') {
        await updateOrderPaymentStatus(
          orderId!,
          paymentId.toString(),
          'approved',
          paymentMethod!
        )
      } else if (status === 'rejected') {
        await updateOrderPaymentStatus(
          orderId!,
          paymentId.toString(),
          'rejected',
          paymentMethod!
        )
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ received: false }, { status: 500 })
  }
}