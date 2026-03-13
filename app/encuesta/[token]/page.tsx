import { getOrderDetails } from '@/lib/supabase/admin-orders'
import { getReviewByOrderId } from '@/lib/supabase/reviews'
import { verifySurveyToken } from '@/lib/reviews/survey-token'
import Image from 'next/image'
import SurveyForm from './SurveyForm'
import styles from './page.module.css'

const GOOGLE_REVIEW_URL = process.env.GOOGLE_REVIEW_URL || process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL || ''

export default async function OrderSurveyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const payload = verifySurveyToken(token)

  if (!payload) {
    return (
      <main className={styles.page}>
        <div className={styles.shell}>
          <div className={styles.resultCard}>
            <div className={styles.brandSeal}>
              <Image
                src="/logo.png"
                alt="Niña Mar"
                width={72}
                height={72}
                className={styles.brandSealImage}
              />
            </div>
            <p className={styles.resultEyebrow}>Enlace no válido</p>
            <h1 className={styles.resultTitle}>Esta encuesta ya no está disponible</h1>
            <p className={styles.resultText}>
              El enlace puede haber expirado. Si todavía quieres responder, escríbenos y te enviamos uno nuevo.
            </p>
          </div>
        </div>
      </main>
    )
  }

  const { data: order, error } = await getOrderDetails(payload.orderId)

  if (error || !order || (order.customer_email || '').trim().toLowerCase() !== payload.email) {
    return (
      <main className={styles.page}>
        <div className={styles.shell}>
          <div className={styles.resultCard}>
            <div className={styles.brandSeal}>
              <Image
                src="/logo.png"
                alt="Niña Mar"
                width={72}
                height={72}
                className={styles.brandSealImage}
              />
            </div>
            <p className={styles.resultEyebrow}>Orden no encontrada</p>
            <h1 className={styles.resultTitle}>No pudimos cargar esta encuesta</h1>
            <p className={styles.resultText}>
              Verifica el enlace o contacta a Niña Mar para recibir una nueva invitación.
            </p>
          </div>
        </div>
      </main>
    )
  }

  const existingReview = await getReviewByOrderId(order.id)

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.heroCard}>
          <div className={styles.heroBrandRow}>
            <div className={styles.brandSeal}>
              <Image
                src="/logo.png"
                alt="Niña Mar"
                width={72}
                height={72}
                className={styles.brandSealImage}
                priority
              />
            </div>
          </div>
          <p className={styles.heroEyebrow}>Niña Mar</p>
          <h1 className={styles.heroTitle}>Queremos conocer tu experiencia</h1>
          <p className={styles.heroText}>
            Responde esta breve encuesta sobre tu pedido y ayúdanos a mejorar cada detalle.
          </p>
        </div>

        <SurveyForm
          token={token}
          customerName={order.customer_name}
          orderNumber={order.order_number}
          alreadySubmitted={Boolean(existingReview)}
          googleReviewUrl={existingReview && existingReview.rating >= 4 ? GOOGLE_REVIEW_URL : ''}
        />
      </div>
    </main>
  )
}