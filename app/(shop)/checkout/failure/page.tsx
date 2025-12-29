"use client"

import Container from "@/components/ui/Container"
import Link from "next/link"
import { XCircle } from "lucide-react"
import styles from "./page.module.css"

export default function FailurePage() {
  return (
    <div className={styles.page}>
      <Container>
        <div className={styles.content}>
          <div className={styles.iconWrapper}>
            <XCircle className={styles.icon} />
          </div>
          
          <h1 className={styles.title}>Pago Rechazado</h1>
          <p className={styles.subtitle}>
            No pudimos procesar tu pago. Por favor intenta de nuevo.
          </p>

          <div className={styles.reasons}>
            <h2 className={styles.reasonsTitle}>Posibles razones:</h2>
            <ul className={styles.reasonsList}>
              <li>Fondos insuficientes</li>
              <li>Datos de pago incorrectos</li>
              <li>Límite de transacción excedido</li>
              <li>Tarjeta vencida o bloqueada</li>
            </ul>
          </div>

          <div className={styles.actions}>
            <Link href="/checkout" className={styles.primaryButton}>
              Intentar de Nuevo
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