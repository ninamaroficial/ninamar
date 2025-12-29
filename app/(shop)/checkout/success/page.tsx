"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Container from "@/components/ui/Container"
import Link from "next/link"
import { CheckCircle, Package, Mail } from "lucide-react"
import styles from "./page.module.css"

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')
  const [order, setOrder] = useState<any>(null)

  useEffect(() => {
    if (orderId) {
      // Obtener detalles de la orden
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
            <CheckCircle className={styles.icon} />
          </div>
          
          <h1 className={styles.title}>¡Pago Exitoso!</h1>
          <p className={styles.subtitle}>
            Tu pedido ha sido confirmado y está siendo procesado
          </p>

          {order && (
            <div className={styles.orderInfo}>
              <div className={styles.orderNumber}>
                <Package size={20} />
                <span>Número de orden: <strong>{order.order_number}</strong></span>
              </div>
              <div className={styles.orderEmail}>
                <Mail size={20} />
                <span>Te enviamos la confirmación a <strong>{order.customer_email}</strong></span>
              </div>
            </div>
          )}

          <div className={styles.nextSteps}>
            <h2 className={styles.stepsTitle}>¿Qué sigue?</h2>
            <ol className={styles.stepsList}>
              <li>Recibirás un email de confirmación</li>
              <li>Prepararemos tu pedido personalizado</li>
              <li>Te notificaremos cuando sea enviado</li>
              <li>Recibirás tu joya en 3-5 días hábiles</li>
            </ol>
          </div>

          <div className={styles.actions}>
            <Link href="/productos" className={styles.primaryButton}>
              Seguir Comprando
            </Link>
            <Link href="/" className={styles.secondaryButton}>
              Volver al Inicio
            </Link>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <SuccessContent />
    </Suspense>
  )
}