import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

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

    // Buscar orden con shipment info
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
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
        delivered_at,
        order_items (
          id,
          product_name,
          product_image,
          quantity,
          unit_price,
          total_price,
          customization_details
        ),
        shipments (
          carrier,
          tracking_number,
          shipping_date,
          estimated_delivery_date,
          notes
        )
      `)
      .eq('order_number', orderNumber)
      .eq('customer_email', email)
      .single()

    if (error || !order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    // ✅ Formatear respuesta de forma limpia
    const response = {
      order_number: order.order_number,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      shipping_address: order.shipping_address,
      shipping_city: order.shipping_city,
      shipping_state: order.shipping_state,
      subtotal: order.subtotal,
      shipping_cost: order.shipping_cost,
      total: order.total,
      status: order.status,
      payment_status: order.payment_status,
      created_at: order.created_at,
      paid_at: order.paid_at,
      processing_at: order.processing_at,
      shipped_at: order.shipped_at,
      delivered_at: order.delivered_at,
      items: order.order_items || [],
      items_count: order.order_items?.length || 0,
      shipment: order.shipments && order.shipments.length > 0 ? order.shipments[0] : null
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching order tracking:', error)
    return NextResponse.json(
      { error: 'Error al buscar la orden' },
      { status: 500 }
    )
  }
}