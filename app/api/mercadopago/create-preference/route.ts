import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, orderNumber, items, payer, total } = body

    console.log('=== MERCADOPAGO DEBUG ===')
    console.log('Order ID:', orderId)
    console.log('Items count:', items.length)
    console.log('Expected total:', total)

    // Verificar variables de entorno
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN no está configurado')
    }

    if (!process.env.SITE_URL) {
      throw new Error('SITE_URL no está configurado')
    }

    // Configurar MercadoPago
    const client = new MercadoPagoConfig({ 
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
      options: { timeout: 10000 }
    })

    const preference = new Preference(client)

    // URLs de retorno
    const baseUrl = process.env.SITE_URL

    // Preparar items
    const mpItems = items.map((item: any) => {
      const itemData = {
        id: String(item.product_id),
        title: String(item.product_name).substring(0, 256),
        description: String(item.customization_summary || 'Producto personalizado').substring(0, 256),
        quantity: Number(item.quantity),
        currency_id: 'COP',
        unit_price: Number(item.unit_price)
      }
      
      // Solo agregar picture_url si existe y no es el item de envío
      if (item.product_image && item.product_id !== 'shipping') {
        return {
          ...itemData,
          picture_url: String(item.product_image)
        }
      }
      
      return itemData
    })

    // ✅ Calcular total de items
    const itemsTotal = mpItems.reduce((sum: number, item: any) => {
      return sum + (item.unit_price * item.quantity)
    }, 0)

    console.log('Items preparados:', mpItems)
    console.log('Items total calculado:', itemsTotal)
    console.log('Total esperado:', total)

    // ✅ Verificar que el total coincida (tolerancia de 1 peso por redondeos)
    if (Math.abs(itemsTotal - total) > 1) {
      console.error('❌ TOTAL MISMATCH!')
      console.error('Items total:', itemsTotal)
      console.error('Expected total:', total)
      console.error('Difference:', itemsTotal - total)
      throw new Error(`El total de los items (${itemsTotal}) no coincide con el total esperado (${total})`)
    }

    // Crear preferencia de pago
    const preferenceBody: any = {
      items: mpItems,
      back_urls: {
        success: `${baseUrl}/checkout/success?order_id=${orderId}`,
        failure: `${baseUrl}/checkout/failure?order_id=${orderId}`,
        pending: `${baseUrl}/checkout/pending?order_id=${orderId}`
      },
      auto_return: 'approved', // ✅ AGREGAR: retorno automático al aprobar
      external_reference: String(orderId),
      statement_descriptor: 'NINAMAR',
      notification_url: `${baseUrl}/api/mercadopago/webhook`, // ✅ AGREGAR: webhook URL
      metadata: {
        order_id: String(orderId),
        order_number: String(orderNumber)
      }
    }

    // Agregar información del pagador si está disponible
    if (payer && payer.email) {
      const payerData: any = {
        email: String(payer.email)
      }

      if (payer.name) {
        payerData.name = String(payer.name)
      }

      if (payer.phone) {
        payerData.phone = {
          area_code: '57',
          number: String(payer.phone).replace(/\D/g, '').substring(0, 15)
        }
      }

      if (payer.document) {
        payerData.identification = {
          type: 'CC',
          number: String(payer.document).replace(/\D/g, '')
        }
      }

      if (payer.address) {
        payerData.address = {
          street_name: String(payer.address).substring(0, 256),
          zip_code: String(payer.zip_code || '000000')
        }
      }

      preferenceBody.payer = payerData
    }

    console.log('Preference body:', JSON.stringify(preferenceBody, null, 2))
    console.log('Creating preference...')

    const preferenceData = await preference.create({ body: preferenceBody })

    console.log('✅ Preference Created Successfully!')
    console.log('Preference ID:', preferenceData.id)
    console.log('Init Point:', preferenceData.init_point)
    console.log('=== END DEBUG ===')

    return NextResponse.json({ 
      preferenceId: preferenceData.id,
      initPoint: preferenceData.init_point 
    })
  } catch (error: any) {
    console.error('=== MERCADOPAGO ERROR ===')
    console.error('Error message:', error.message)
    console.error('Error status:', error.status)
    console.error('Error code:', error.error)
    
    // Mostrar detalles del error de validación si existen
    if (error.cause && error.cause.length > 0) {
      console.error('Validation errors:', JSON.stringify(error.cause, null, 2))
    }
    
    console.error('Full error:', JSON.stringify(error, null, 2))
    console.error('=== END ERROR ===')
    
    return NextResponse.json(
      { 
        error: 'Error al crear la preferencia de pago',
        details: error.message,
        validationErrors: error.cause || null
      },
      { status: 500 }
    )
  }
}