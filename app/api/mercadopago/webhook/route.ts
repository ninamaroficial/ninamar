import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { updateOrderPaymentStatus } from '@/lib/supabase/orders'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('========================================')
    console.log('🔔 WEBHOOK RECEIVED')
    console.log('Full body:', JSON.stringify(body, null, 2))
    console.log('========================================')

    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      console.error('❌ MERCADOPAGO_ACCESS_TOKEN not configured')
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }

    console.log('✅ Access Token is present')

    const client = new MercadoPagoConfig({ 
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
      options: { timeout: 10000 }
    })

    const payment = new Payment(client)

    // MercadoPago envía notificaciones de tipo "payment"
    if (body.type === 'payment' && body.data && body.data.id) {
      const paymentId = body.data.id

      console.log('💳 Processing payment ID:', paymentId)

      try {
        // Obtener información completa del pago
        console.log('📡 Fetching payment info from MercadoPago...')
        const paymentInfo = await payment.get({ id: paymentId })

        console.log('✅ Payment info retrieved successfully')
        console.log('Payment Details:')
        console.log('- ID:', paymentInfo.id)
        console.log('- Status:', paymentInfo.status)
        console.log('- Status Detail:', paymentInfo.status_detail)
        console.log('- Payment Method:', paymentInfo.payment_method_id)
        console.log('- External Reference:', paymentInfo.external_reference)
        console.log('- Transaction Amount:', paymentInfo.transaction_amount)
        console.log('- Currency:', paymentInfo.currency_id)

        const orderId = paymentInfo.external_reference
        const status = paymentInfo.status
        const paymentMethod = paymentInfo.payment_method_id

        if (!orderId) {
          console.error('❌ No external_reference (order_id) found in payment')
          console.error('Payment info:', JSON.stringify(paymentInfo, null, 2))
          return NextResponse.json({ 
            received: true, 
            updated: false,
            error: 'No order_id in payment' 
          })
        }

        console.log('📦 Updating order:', orderId)
        console.log('Payment status:', status)

        // Actualizar estado de la orden según el estado del pago
        if (status === 'approved') {
          console.log('✅ Payment APPROVED - Updating order to PAID')
          try {
            await updateOrderPaymentStatus(
              orderId,
              paymentId.toString(),
              'approved',
              paymentMethod || 'unknown'
            )
            console.log('✅ Order updated successfully in database')
          } catch (dbError) {
            console.error('❌ Database update error:', dbError)
            throw dbError
          }
        } else if (status === 'rejected') {
          console.log('❌ Payment REJECTED - Updating order')
          await updateOrderPaymentStatus(
            orderId,
            paymentId.toString(),
            'rejected',
            paymentMethod || 'unknown'
          )
          console.log('✅ Order marked as rejected')
        } else if (status === 'pending' || status === 'in_process') {
          console.log('⏳ Payment PENDING/IN_PROCESS - Keeping pending status')
        } else {
          console.log('ℹ️ Unknown payment status:', status)
        }

        console.log('========================================')
        return NextResponse.json({ 
          received: true, 
          updated: true,
          orderId: orderId,
          paymentId: paymentId,
          status: status 
        })

      } catch (paymentError: any) {
        console.error('========================================')
        console.error('❌ Error fetching payment info from MercadoPago')
        console.error('Payment ID:', paymentId)
        console.error('Error message:', paymentError.message)
        console.error('Error details:', paymentError)
        console.error('========================================')
        
        return NextResponse.json({ 
          received: true, 
          error: 'Error fetching payment',
          details: paymentError.message 
        }, { status: 500 })
      }
    }

    console.log('ℹ️ Webhook type not "payment" or no data.id')
    console.log('Type received:', body.type)
    console.log('========================================')
    return NextResponse.json({ received: true, updated: false })

  } catch (error: any) {
    console.error('========================================')
    console.error('❌ WEBHOOK GENERAL ERROR')
    console.error('Error:', error)
    console.error('Error message:', error.message)
    console.error('========================================')
    return NextResponse.json({ 
      received: false, 
      error: 'Webhook processing failed',
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'MercadoPago webhook endpoint is working',
    timestamp: new Date().toISOString()
  })
}