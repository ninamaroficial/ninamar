import { NextRequest, NextResponse } from 'next/server'
import { getOrderDetails } from '@/lib/supabase/admin-orders'
import { createOrderReview, getReviewByOrderId } from '@/lib/supabase/reviews'
import { verifySurveyToken } from '@/lib/reviews/survey-token'

const GOOGLE_REVIEW_URL = process.env.GOOGLE_REVIEW_URL || process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL || ''

function normalizeText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim()

  if (!normalized) {
    return null
  }

  return normalized.slice(0, maxLength)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const token = typeof body.token === 'string' ? body.token : ''
    const rating = Number(body.rating)
    const productRating = Number(body.productRating)
    const deliveryRating = Number(body.deliveryRating)

    if (!token) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 400 })
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'La calificación debe estar entre 1 y 5' }, { status: 400 })
    }

    if (!Number.isInteger(productRating) || productRating < 1 || productRating > 5) {
      return NextResponse.json({ error: 'La calificación del producto debe estar entre 1 y 5' }, { status: 400 })
    }

    if (!Number.isInteger(deliveryRating) || deliveryRating < 1 || deliveryRating > 5) {
      return NextResponse.json({ error: 'La calificación de la entrega debe estar entre 1 y 5' }, { status: 400 })
    }

    const payload = verifySurveyToken(token)

    if (!payload) {
      return NextResponse.json({ error: 'El enlace de encuesta no es válido o expiró' }, { status: 401 })
    }

    const { data: order, error } = await getOrderDetails(payload.orderId)

    if (error || !order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    if ((order.customer_email || '').trim().toLowerCase() !== payload.email) {
      return NextResponse.json({ error: 'El enlace no corresponde a esta orden' }, { status: 401 })
    }

    if (order.status !== 'delivered') {
      return NextResponse.json(
        { error: 'La encuesta solo está disponible para pedidos entregados' },
        { status: 400 }
      )
    }

    const existingReview = await getReviewByOrderId(order.id)

    if (existingReview) {
      return NextResponse.json(
        {
          error: 'Esta encuesta ya fue respondida',
          alreadySubmitted: true,
          googleReviewUrl: existingReview.rating >= 4 ? GOOGLE_REVIEW_URL : '',
        },
        { status: 409 }
      )
    }

    await createOrderReview({
      order_id: order.id,
      order_number: order.order_number,
      customer_phone: order.customer_phone || null,
      customer_email: order.customer_email || null,
      customer_name: order.customer_name,
      rating,
      product_rating: productRating,
      delivery_rating: deliveryRating,
      comment: normalizeText(body.comment, 800) || undefined,
      would_recommend: rating >= 4,
    })

    return NextResponse.json({
      success: true,
      googleReviewUrl: rating >= 4 ? GOOGLE_REVIEW_URL : '',
    })
  } catch (error) {
    console.error('Error saving order survey:', error)
    return NextResponse.json(
      { error: 'No se pudo guardar la encuesta' },
      { status: 500 }
    )
  }
}