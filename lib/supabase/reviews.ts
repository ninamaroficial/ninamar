/**
 * Módulo para gestionar encuestas de satisfacción de órdenes
 */

import { createAdminClient } from './admin'

export interface OrderReview {
  id: string
  order_id: string
  order_number: string
  customer_phone: string
  customer_name: string | null
  rating: number
  comment: string | null
  would_recommend: boolean | null
  liked_most: string | null
  improvement_suggestion: string | null
  created_at: string
  updated_at: string
}

export interface CreateReviewData {
  order_id: string
  order_number: string
  customer_phone: string
  customer_name?: string
  rating: number
  comment?: string
  would_recommend?: boolean
  liked_most?: string
  improvement_suggestion?: string
}

/**
 * Crear una nueva encuesta de satisfacción
 */
export async function createOrderReview(data: CreateReviewData) {
  const supabase = createAdminClient()

  const { data: review, error } = await supabase
    .from('order_reviews')
    .insert({
      order_id: data.order_id,
      order_number: data.order_number,
      customer_phone: data.customer_phone,
      customer_name: data.customer_name || null,
      rating: data.rating,
      comment: data.comment || null,
      would_recommend: data.would_recommend ?? null,
      liked_most: data.liked_most || null,
      improvement_suggestion: data.improvement_suggestion || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating review:', error)
    throw error
  }

  return review as OrderReview
}

/**
 * Obtener encuesta por ID de orden
 */
export async function getReviewByOrderId(orderId: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('order_reviews')
    .select('*')
    .eq('order_id', orderId)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    console.error('Error fetching review:', error)
    throw error
  }

  return data as OrderReview | null
}

/**
 * Obtener todas las encuestas (para admin dashboard)
 */
export async function getAllReviews(limit = 50, offset = 0) {
  const supabase = createAdminClient()

  const { data, error, count } = await supabase
    .from('order_reviews')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching reviews:', error)
    throw error
  }

  return {
    reviews: data as OrderReview[],
    total: count || 0,
  }
}

/**
 * Obtener estadísticas de encuestas
 */
export async function getReviewsStats() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('order_reviews')
    .select('rating, would_recommend')

  if (error) {
    console.error('Error fetching reviews stats:', error)
    throw error
  }

  const reviews = data as OrderReview[]
  const totalReviews = reviews.length

  if (totalReviews === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      recommendationRate: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    }
  }

  // Calcular calificación promedio
  const sumRatings = reviews.reduce((sum, r) => sum + r.rating, 0)
  const averageRating = sumRatings / totalReviews

  // Calcular tasa de recomendación
  const recommendCount = reviews.filter(r => r.would_recommend === true).length
  const recommendationRate = (recommendCount / totalReviews) * 100

  // Distribución de calificaciones
  const ratingDistribution = reviews.reduce((dist, review) => {
    dist[review.rating as 1 | 2 | 3 | 4 | 5] = (dist[review.rating as 1 | 2 | 3 | 4 | 5] || 0) + 1
    return dist
  }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>)

  return {
    totalReviews,
    averageRating: parseFloat(averageRating.toFixed(2)),
    recommendationRate: parseFloat(recommendationRate.toFixed(2)),
    ratingDistribution,
  }
}

/**
 * Obtener reviews públicas (4 y 5 estrellas con comentarios)
 */
export async function getPublicReviews(limit = 10) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('order_reviews')
    .select('rating, comment, customer_name, created_at')
    .gte('rating', 4) // Solo 4 y 5 estrellas
    .not('comment', 'is', null) // Solo con comentarios
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching public reviews:', error)
    throw error
  }

  return data as Pick<OrderReview, 'rating' | 'comment' | 'customer_name' | 'created_at'>[]
}
