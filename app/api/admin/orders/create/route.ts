import { NextRequest, NextResponse } from 'next/server'
import { createOrder } from '@/lib/supabase/orders'
import { createAdminClient } from '@/lib/supabase/admin'
import type { CreateOrderData } from '@/types/order.types'
import { verifyAdminToken } from '@/lib/auth/admin'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación de admin
    const token = request.cookies.get('admin_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = verifyAdminToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const body: CreateOrderData & { 
      payment_method?: string
      payment_status?: 'pending' | 'approved' | 'rejected'
      status?: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
    } = await request.json()

    // Validaciones básicas
    if (!body.customer_name || !body.customer_email) {
      return NextResponse.json(
        { error: 'Datos incompletos del cliente' },
        { status: 400 }
      )
    }

    if (!body.customer_phone || !body.customer_document) {
      return NextResponse.json(
        { error: 'Falta teléfono o documento' },
        { status: 400 }
      )
    }

    if (!body.shipping_address || !body.shipping_city || !body.shipping_state) {
      return NextResponse.json(
        { error: 'Falta información de envío' },
        { status: 400 }
      )
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'No hay productos en la orden' },
        { status: 400 }
      )
    }

    // Validar valores numéricos
    if (typeof body.subtotal !== 'number' || body.subtotal <= 0) {
      return NextResponse.json(
        { error: 'Subtotal inválido' },
        { status: 400 }
      )
    }

    if (typeof body.shipping_cost !== 'number' || body.shipping_cost < 0) {
      return NextResponse.json(
        { error: 'Costo de envío inválido' },
        { status: 400 }
      )
    }

    if (typeof body.total !== 'number' || body.total <= 0) {
      return NextResponse.json(
        { error: 'Total inválido' },
        { status: 400 }
      )
    }

    // Crear la orden usando la función existente
    const order = await createOrder(body)

    // Si se especificó un estado de pago o método de pago, actualizar la orden
    const supabase = createAdminClient()
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (body.payment_method) {
      updateData.payment_method = body.payment_method
    }

    if (body.payment_status) {
      updateData.payment_status = body.payment_status
      if (body.payment_status === 'approved') {
        updateData.status = body.status || 'paid'
        updateData.paid_at = new Date().toISOString()
      }
    }

    if (body.status) {
      updateData.status = body.status
    }

    // Actualizar la orden si hay cambios
    if (Object.keys(updateData).length > 1) { // Más que solo updated_at
      const { error: updateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', order.id)

      if (updateError) {
        console.error('Error updating order:', updateError)
        // No fallar, solo loguear el error
      }
    }

    // Obtener la orden actualizada
    const { data: updatedOrder } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order.id)
      .single()

    return NextResponse.json(updatedOrder || order)
  } catch (error) {
    console.error('❌ Error creating manual order:', error)
    return NextResponse.json(
      { error: 'Error al crear la orden' },
      { status: 500 }
    )
  }
}