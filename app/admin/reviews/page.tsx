"use client"

import { useEffect, useMemo, useState } from 'react'
import { MessageSquare, Star } from 'lucide-react'
import styles from './page.module.css'

interface ReviewsStats {
  totalReviews: number
  averageRating: number
  recommendationRate: number
  ratingDistribution: Record<string, number>
}

interface ReviewItem {
  id: string
  order_number: string
  customer_name: string | null
  rating: number
  product_rating: number | null
  delivery_rating: number | null
  comment: string | null
  created_at: string
}

interface ReviewsResponse {
  reviews: ReviewItem[]
  total: number
  page: number
  totalPages: number
}

function Stars({ value }: { value: number | null | undefined }) {
  const safeValue = Math.max(0, Math.min(5, Number(value || 0)))
  return (
    <div className={styles.stars} aria-label={`Calificación ${safeValue} de 5`}>
      {[1, 2, 3, 4, 5].map((idx) => (
        <Star
          key={idx}
          size={14}
          className={idx <= safeValue ? styles.starOn : styles.starOff}
          fill={idx <= safeValue ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  )
}

export default function AdminReviewsPage() {
  const [stats, setStats] = useState<ReviewsStats | null>(null)
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [statsRes, reviewsRes] = await Promise.all([
        fetch('/api/admin/reviews?stats=true', { cache: 'no-store' }),
        fetch('/api/admin/reviews?page=1&limit=50', { cache: 'no-store' }),
      ])

      if (!statsRes.ok || !reviewsRes.ok) {
        throw new Error('No se pudo cargar la información de encuestas')
      }

      const statsData = (await statsRes.json()) as ReviewsStats
      const reviewsData = (await reviewsRes.json()) as ReviewsResponse

      setStats(statsData)
      setReviews(Array.isArray(reviewsData.reviews) ? reviewsData.reviews : [])
    } catch (err: any) {
      console.error('Error loading reviews:', err)
      setError(err?.message || 'Error cargando opiniones')
    } finally {
      setIsLoading(false)
    }
  }

  const formattedAverage = useMemo(() => {
    if (!stats) return '0.0'
    return Number(stats.averageRating || 0).toFixed(1)
  }, [stats])

  const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.heading}>
          <h1 className={styles.title}>Opiniones de Clientes</h1>
          <p className={styles.subtitle}>Resultados de formularios de satisfacción por pedido.</p>
        </div>

        {isLoading ? (
          <div className={styles.loading}>Cargando opiniones...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <>
            <section className={styles.statsGrid}>
              <article className={styles.statCard}>
                <p className={styles.statLabel}>Total de opiniones</p>
                <p className={styles.statValue}>{stats?.totalReviews ?? 0}</p>
              </article>

              <article className={styles.statCard}>
                <p className={styles.statLabel}>Calificación promedio</p>
                <p className={styles.statValue}>{formattedAverage}</p>
                <Stars value={Number(formattedAverage)} />
              </article>

              <article className={styles.statCard}>
                <p className={styles.statLabel}>Tasa de recomendación</p>
                <p className={styles.statValue}>{stats?.recommendationRate ?? 0}%</p>
              </article>
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Detalle de opiniones</h2>

              {reviews.length === 0 ? (
                <div className={styles.empty}>
                  <MessageSquare size={36} />
                  <p>No hay opiniones registradas aún.</p>
                </div>
              ) : (
                <div className={styles.reviewList}>
                  {reviews.map((review) => (
                    <article className={styles.reviewCard} key={review.id}>
                      <div className={styles.reviewHeader}>
                        <div>
                          <p className={styles.customerName}>{review.customer_name || 'Cliente'}</p>
                          <p className={styles.orderNumber}>Pedido {review.order_number}</p>
                        </div>
                        <p className={styles.reviewDate}>{formatDate(review.created_at)}</p>
                      </div>

                      <div className={styles.ratingsRow}>
                        <div className={styles.ratingItem}>
                          <span>General</span>
                          <Stars value={review.rating} />
                        </div>
                        <div className={styles.ratingItem}>
                          <span>Producto</span>
                          <Stars value={review.product_rating} />
                        </div>
                        <div className={styles.ratingItem}>
                          <span>Entrega</span>
                          <Stars value={review.delivery_rating} />
                        </div>
                      </div>

                      <p className={styles.comment}>
                        {review.comment && review.comment.trim().length > 0
                          ? review.comment
                          : 'Sin comentario adicional.'}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}
