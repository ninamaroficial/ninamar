import { NextRequest, NextResponse } from 'next/server'
import { createOrder } from '@/lib/supabase/orders'
import type { CreateOrderData } from '@/types/order.types'

export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderData = await request.json()

    // Validaciones básicas
    if (!body.customer_name || !body.customer_email) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'No hay productos en la orden' },
        { status: 400 }
      )
    }

    // Crear la orden
    const order = await createOrder(body)

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Error al crear la orden' },
      { status: 500 }
    )
  }
}