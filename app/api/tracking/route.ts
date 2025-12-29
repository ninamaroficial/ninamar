import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const orderNumber = searchParams.get('order_number')
    const email = searchParams.get('email')

    if (!orderNumber || !email) {
      return NextResponse.json(
        { error: 'Número de orden y email son requeridos' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Buscar orden por número y email
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        shipping_city,
        shipping_state,
        subtotal,
        shipping_cost,
        total,
        status,
        payment_status,
        created_at,
        paid_at,
        processing_at,
        shipped_at,
        delivered_at
      `)
      .eq('order_number', orderNumber)
      .ilike('customer_email', email)
      .single()

    if (error || !order) {
      console.error('Tracking error:', error)
      return NextResponse.json(
        { error: 'Orden no encontrada. Verifica el número de orden y email.' },
        { status: 404 }
      )
    }

    // Obtener items de la orden
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id)

    if (itemsError) {
      console.error('Error fetching items:', itemsError)
    }

    return NextResponse.json({
      ...order,
      items: items || [],
      items_count: items?.length || 0
    })

  } catch (error) {
    console.error('Tracking error:', error)
    return NextResponse.json(
      { error: 'Error al buscar la orden' },
      { status: 500 }
    )
  }
}