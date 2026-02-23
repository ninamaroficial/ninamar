import { NextRequest, NextResponse } from 'next/server'
import { sendSatisfactionSurvey } from '@/lib/whatsapp/notifications'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Endpoint de prueba para enviar encuesta de satisfacción
 * GET /api/admin/test-survey?phone=3213326705&orderId=xxx (opcional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')
    const orderId = searchParams.get('orderId')
    
    if (!phone) {
      return NextResponse.json(
        { error: 'Se requiere el parámetro phone' },
        { status: 400 }
      )
    }

    console.log(`🔍 Buscando pedidos para teléfono: ${phone}`)

    const supabase = createAdminClient()

    // Si se especifica orderId, buscar ese pedido específicamente
    if (orderId) {
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (error || !order) {
        return NextResponse.json(
          { error: 'Pedido no encontrado' },
          { status: 404 }
        )
      }

      // Enviar encuesta
      await sendSatisfactionSurvey(
        order.customer_phone,
        order.customer_name,
        order.order_number,
        order.id
      )

      return NextResponse.json({
        success: true,
        message: 'Encuesta enviada correctamente',
        order: {
          id: order.id,
          order_number: order.order_number,
          customer_name: order.customer_name,
          status: order.status,
          phone: order.customer_phone
        }
      })
    }

    // Si no hay orderId, buscar todos los pedidos para este número
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, order_number, status, customer_name, customer_phone, created_at')
      .eq('customer_phone', phone)
      .order('created_at', { ascending: false })

    if (error || !orders || orders.length === 0) {
      console.error('Pedidos no encontrados:', error)
      return NextResponse.json(
        { 
          error: 'No se encontraron pedidos para este número',
          phone: phone,
          tip: 'Verifica que el número esté guardado correctamente en la base de datos'
        },
        { status: 404 }
      )
    }

    console.log(`✅ Se encontraron ${orders.length} pedido(s)`)

    return NextResponse.json({
      success: true,
      message: 'Pedidos encontrados. Elige uno para enviar encuesta.',
      phone: phone,
      orders: orders,
      instructions: 'Para enviar encuesta a un pedido específico, usa: /api/admin/test-survey?phone=XXX&orderId=YYY'
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al buscar pedidos', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

