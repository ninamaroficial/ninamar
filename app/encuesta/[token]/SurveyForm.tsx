'use client'

import { useState } from 'react'
import styles from './page.module.css'

interface SurveyFormProps {
  token: string
  customerName: string
  orderNumber: string
  alreadySubmitted: boolean
  googleReviewUrl?: string
}

function StarRatingQuestion({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <section className={styles.block}>
      <label className={styles.label}>{label}</label>
      <div className={styles.ratingRow}>
        {[1, 2, 3, 4, 5].map((starValue) => (
          <button
            key={starValue}
            type="button"
            className={starValue <= value ? `${styles.starButton} ${styles.starButtonActive}` : styles.starButton}
            onClick={() => onChange(starValue)}
            aria-label={`Calificar con ${starValue} estrella${starValue > 1 ? 's' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
    </section>
  )
}

export default function SurveyForm({
  token,
  customerName,
  orderNumber,
  alreadySubmitted,
  googleReviewUrl,
}: SurveyFormProps) {
  const [rating, setRating] = useState(0)
  const [productRating, setProductRating] = useState(0)
  const [deliveryRating, setDeliveryRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(alreadySubmitted)
  const [error, setError] = useState('')
  const [googleUrl, setGoogleUrl] = useState(googleReviewUrl || '')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (rating < 1 || rating > 5 || productRating < 1 || productRating > 5 || deliveryRating < 1 || deliveryRating > 5) {
      setError('Responde todas las preguntas con una calificación entre 1 y 5 estrellas.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/reviews/order-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          rating,
          productRating,
          deliveryRating,
          comment,
        }),
      })

      const data = await response.json()

      if (!response.ok && !data.alreadySubmitted) {
        throw new Error(data.error || 'No se pudo enviar tu respuesta')
      }

      setGoogleUrl(data.googleReviewUrl || googleReviewUrl || '')
      setIsSubmitted(true)
    } catch (submitError: any) {
      setError(submitError.message || 'No se pudo enviar tu respuesta')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className={styles.resultCard}>
        <p className={styles.resultEyebrow}>Encuesta registrada</p>
        <h2 className={styles.resultTitle}>Gracias por compartir tu experiencia</h2>
        <p className={styles.resultText}>
          Tu respuesta para el pedido {orderNumber} ya quedó guardada y nos ayuda a mejorar.
        </p>
        {googleUrl && (
          <a href={googleUrl} target="_blank" rel="noreferrer" className={styles.googleButton}>
            Calificarnos en Google
          </a>
        )}
        {!googleUrl && (
          <p className={styles.resultHint}>
            Si necesitas ayuda adicional, también puedes responder el correo o escribirnos por WhatsApp.
          </p>
        )}
      </div>
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formIntro}>
        <p className={styles.eyebrow}>Pedido {orderNumber}</p>
        <h1 className={styles.title}>Hola {customerName}, cuéntanos cómo te fue</h1>
        <p className={styles.description}>
          Esta encuesta es breve. Solo selecciona una calificación por pregunta y, si quieres, déjanos un comentario adicional.
        </p>
      </div>

      <StarRatingQuestion
        label="¿Cómo calificarías tu experiencia general con el pedido?"
        value={rating}
        onChange={setRating}
      />

      <StarRatingQuestion
        label="¿Cómo calificarías el producto que recibiste?"
        value={productRating}
        onChange={setProductRating}
      />

      <StarRatingQuestion
        label="¿Cómo calificarías la entrega y el estado del pedido al recibirlo?"
        value={deliveryRating}
        onChange={setDeliveryRating}
      />

      <section className={styles.block}>
        <label className={styles.label} htmlFor="comment">Comentario adicional</label>
        <textarea
          id="comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          className={styles.textarea}
          maxLength={800}
          placeholder="Comparte cualquier detalle adicional que quieras contarnos"
        />
      </section>

      {error && <p className={styles.error}>{error}</p>}

      <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
        {isSubmitting ? 'Enviando respuesta...' : 'Enviar encuesta'}
      </button>

      <p className={styles.note}>
        Si tu experiencia fue positiva, al finalizar te mostraremos el enlace para dejar tu reseña en Google.
      </p>
    </form>
  )
}