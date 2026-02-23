import { NextRequest, NextResponse } from 'next/server'
import { createOrder } from '@/lib/supabase/orders'
import { sendOrderConfirmationMessage } from '@/lib/whatsapp/notifications'
import type { CreateOrderData } from '@/types/order.types'

export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderData = await request.json()

    // Log para debugging
    console.log('📦 Received order data:', {
      customer_email: body.customer_email,
      subtotal: body.subtotal,
      shipping_cost: body.shipping_cost,
      total: body.total,
      shipping_city: body.shipping_city,
      shipping_state: body.shipping_state,
      items_count: body.items?.length
    })

    // Validaciones de datos del cliente
    if (!body.customer_name || !body.customer_email) {
      console.error('❌ Missing customer data')
      return NextResponse.json(
        { error: 'Datos incompletos del cliente' },
        { status: 400 }
      )
    }

    if (!body.customer_phone || !body.customer_document) {
      console.error('❌ Missing phone or document')
      return NextResponse.json(
        { error: 'Falta teléfono o documento' },
        { status: 400 }
      )
    }

    // Validaciones de dirección de envío
    if (!body.shipping_address || !body.shipping_city || !body.shipping_state) {
      console.error('❌ Missing shipping data')
      return NextResponse.json(
        { error: 'Falta información de envío' },
        { status: 400 }
      )
    }

    // Validaciones de productos
    if (!body.items || body.items.length === 0) {
      console.error('❌ No items in order')
      return NextResponse.json(
        { error: 'No hay productos en la orden' },
        { status: 400 }
      )
    }

    // Validaciones de valores numéricos
    if (typeof body.subtotal !== 'number' || body.subtotal <= 0) {
      console.error('❌ Invalid subtotal:', body.subtotal)
      return NextResponse.json(
        { error: 'Subtotal inválido' },
        { status: 400 }
      )
    }

    if (typeof body.shipping_cost !== 'number' || body.shipping_cost < 0) {
      console.error('❌ Invalid shipping_cost:', body.shipping_cost)
      return NextResponse.json(
        { error: 'Costo de envío inválido' },
        { status: 400 }
      )
    }

    if (typeof body.total !== 'number' || body.total <= 0) {
      console.error('❌ Invalid total:', body.total)
      return NextResponse.json(
        { error: 'Total inválido' },
        { status: 400 }
      )
    }

    // Validar que el total sea correcto (subtotal + shipping_cost)
    const calculatedTotal = body.subtotal + body.shipping_cost
    if (Math.abs(calculatedTotal - body.total) > 0.01) {
      console.error('❌ Total mismatch:', {
        subtotal: body.subtotal,
        shipping_cost: body.shipping_cost,
        calculated: calculatedTotal,
        received: body.total
      })
      return NextResponse.json(
        { error: 'El total no coincide con subtotal + envío' },
        { status: 400 }
      )
    }

    // Crear la orden
    console.log('🚀 Creating order...')
    const order = await createOrder(body)

    console.log('✅ Order created successfully:', {
      id: order.id,
      order_number: order.order_number,
      total: order.total
    })

    // 📱 Enviar mensaje de confirmación por WhatsApp
    if (body.customer_phone) {
      sendOrderConfirmationMessage(
        body.customer_phone,
        body.customer_name,
        order.order_number,
        order.total
      ).catch(err => {
        console.error('Failed to send WhatsApp confirmation message:', err)
      })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('❌ Error creating order:', error)
    return NextResponse.json(
      { error: 'Error al crear la orden' },
      { status: 500 }
    )
  }
}