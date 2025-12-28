"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Container from "@/components/ui/Container"
import Link from "next/link"
import { Clock, Mail, AlertCircle } from "lucide-react"
import styles from "./page.module.css"

function PendingContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')
  const [order, setOrder] = useState<any>(null)

  useEffect(() => {
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then(res => res.json())
        .then(data => setOrder(data))
        .catch(err => console.error('Error fetching order:', err))
    }
  }, [orderId])

  return (
    <div className={styles.page}>
      <Container>
        <div className={styles.content}>
          <div className={styles.iconWrapper}>
            <Clock className={styles.icon} />
          </div>
          
          <h1 className={styles.title}>Pago Pendiente</h1>
          <p className={styles.subtitle}>
            Tu pago está siendo procesado
          </p>

          {order && (
            <div className={styles.orderInfo}>
              <div className={styles.infoItem}>
                <AlertCircle size={20} />
                <span>Número de orden: <strong>{order.order_number}</strong></span>
              </div>
              <div className={styles.infoItem}>
                <Mail size={20} />
                <span>Email: <strong>{order.customer_email}</strong></span>
              </div>
            </div>
          )}

          <div className={styles.infoBox}>
            <h2 className={styles.infoTitle}>¿Qué significa esto?</h2>
            <p className={styles.infoText}>
              Algunos métodos de pago (como PSE o transferencias bancarias) pueden 
              tardar unos minutos en confirmar la transacción.
            </p>
            <p className={styles.infoText}>
              Te enviaremos un email de confirmación cuando tu pago sea aprobado.
            </p>
          </div>

          <div className={styles.nextSteps}>
            <h3 className={styles.stepsTitle}>Próximos pasos:</h3>
            <ul className={styles.stepsList}>
              <li>Espera la confirmación por email (puede tardar hasta 24 horas)</li>
              <li>Revisa tu bandeja de entrada y spam</li>
              <li>Si no recibes confirmación, contáctanos</li>
            </ul>
          </div>

          <div className={styles.actions}>
            <Link href="/productos" className={styles.primaryButton}>
              Seguir Comprando
            </Link>
            <Link href="/contacto" className={styles.secondaryButton}>
              Contactar Soporte
            </Link>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default function PendingPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <PendingContent />
    </Suspense>
  )
}