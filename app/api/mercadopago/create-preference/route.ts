import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'

// Configurar MercadoPago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: { timeout: 5000 }
})

const preference = new Preference(client)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, orderNumber, items, payer, total } = body

    // Crear preferencia de pago
    const preferenceData = await preference.create({
      body: {
        items: items.map((item: any) => ({
          id: item.product_id,
          title: item.product_name,
          description: item.customization_summary || 'Producto personalizado',
          picture_url: item.product_image,
          quantity: item.quantity,
          currency_id: 'COP',
          unit_price: item.unit_price
        })),
        payer: {
          name: payer.name,
          email: payer.email,
          phone: {
            area_code: '57',
            number: payer.phone
          },
          identification: {
            type: 'CC',
            number: payer.document
          },
          address: {
            street_name: payer.address,
            zip_code: payer.zip_code || '000000'
          }
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?order_id=${orderId}`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/failure?order_id=${orderId}`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/pending?order_id=${orderId}`
        },
        auto_return: 'approved',
        external_reference: orderId,
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mercadopago/webhook`,
        statement_descriptor: 'NIÑA MAR',
        payment_methods: {
          installments: 12,
          default_installments: 1
        },
        metadata: {
          order_id: orderId,
          order_number: orderNumber
        }
      }
    })

    return NextResponse.json({ 
      preferenceId: preferenceData.id,
      initPoint: preferenceData.init_point 
    })
  } catch (error) {
    console.error('Error creating preference:', error)
    return NextResponse.json(
      { error: 'Error al crear la preferencia de pago' },
      { status: 500 }
    )
  }
}