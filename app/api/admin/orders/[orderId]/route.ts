import { NextRequest, NextResponse } from 'next/server'
import { getOrderDetails, updateOrderStatus } from '@/lib/supabase/admin-orders'
import { createShipment } from '@/lib/supabase/shipments'
import { sendOrderStatusUpdateEmail } from '@/lib/email/resend'

// ... resto del código sin cambios ...
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const { data: order, error } = await getOrderDetails(orderId)

    if (error || !order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Error al obtener orden' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const body = await request.json()
    const { status, shipmentData } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Estado es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el pago esté aprobado antes de actualizar
    const { data: currentOrder, error: fetchError } = await getOrderDetails(orderId)

    if (fetchError || !currentOrder) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    // Validar que el pago esté aprobado
    if (currentOrder.payment_status !== 'approved') {
      return NextResponse.json(
        { 
          error: 'No se puede actualizar el estado. El pago debe estar aprobado primero.',
          payment_status: currentOrder.payment_status 
        },
        { status: 400 }
      )
    }

    // ✅ Si el estado es "shipped", validar y crear registro de envío
    if (status === 'shipped') {
      if (!shipmentData || !shipmentData.carrier || !shipmentData.tracking_number) {
        return NextResponse.json(
          { error: 'Información de envío incompleta. Se requiere proveedor y número de guía.' },
          { status: 400 }
        )
      }

      // Crear registro de envío
      try {
        await createShipment({
          order_id: orderId,
          carrier: shipmentData.carrier,
          tracking_number: shipmentData.tracking_number,
          shipping_date: shipmentData.shipping_date || new Date().toISOString(),
          estimated_delivery_date: shipmentData.estimated_delivery_date || null,
          notes: shipmentData.notes || null,
        })

        console.log('✅ Shipment record created:', {
          orderId,
          carrier: shipmentData.carrier,
          tracking: shipmentData.tracking_number
        })
      } catch (shipmentError) {
        console.error('Error creating shipment:', shipmentError)
        return NextResponse.json(
          { error: 'Error al registrar información de envío' },
          { status: 500 }
        )
      }
    }

    // Actualizar estado de la orden
    const order = await updateOrderStatus(orderId, status)

    console.log('✅ Order status updated:', {
      orderId,
      oldStatus: currentOrder.status,
      newStatus: status
    })

    // Enviar email de actualización de estado
    if (status === 'processing' || status === 'shipped' || status === 'delivered') {
      sendOrderStatusUpdateEmail(
        currentOrder.order_number,
        currentOrder.customer_name,
        currentOrder.customer_email,
        status as 'processing' | 'shipped' | 'delivered',
        status === 'shipped' ? shipmentData : undefined
      ).catch(err => {
        console.error('Failed to send status update email:', err)
      })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Error al actualizar orden' },
      { status: 500 }
    )
  }
}