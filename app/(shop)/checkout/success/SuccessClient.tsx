"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Container from "@/components/ui/Container"
import Link from "next/link"
import { CheckCircle, Package, Mail } from "lucide-react"
import PurchaseTracking from "@/app/components/PurchaseTracking"
import styles from "./page.module.css"

type OrderItem = {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
}

type Order = {
  id?: string
  order_number?: string
  customer_email?: string
  total?: number
  items?: OrderItem[]
}

export default function SuccessClient() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order_id")
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (!orderId) return

    let isMounted = true

    fetch(`/api/orders/${orderId}`, { method: "GET", cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return null
        return res.json()
      })
      .then((data) => {
        if (!isMounted) return
        setOrder(data)
      })
      .catch((err) => console.error("Error fetching order:", err))

    return () => {
      isMounted = false
    }
  }, [orderId])

  return (
    <div className={styles.page}>
      {orderId && order?.id && order?.total && order?.items ? (
        <PurchaseTracking
          orderId={orderId}
          orderNumber={order.order_number || orderId}
          total={order.total}
          items={order.items}
        />
      ) : null}
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
                <span>
                  Número de orden: <strong>{order.order_number}</strong>
                </span>
              </div>
              <div className={styles.orderEmail}>
                <Mail size={20} />
                <span>
                  Te enviamos la confirmación a{" "}
                  <strong>{order.customer_email}</strong>
                </span>
              </div>
            </div>
          )}

          <div className={styles.nextSteps}>
            <h2 className={styles.stepsTitle}>¿Qué sigue?</h2>
            <ol className={styles.stepsList}>
              <li>Recibirás un email de confirmación</li>
              <li>Prepararemos tu pedido personalizado</li>
              <li>Te notificaremos cuando sea enviado</li>
              <li>Se enviará tu accesorio en 5-7 días hábiles</li>
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
