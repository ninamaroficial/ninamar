"use client"

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import styles from './page.module.css'

export default function CheckoutRedirectPage() {
  const searchParams = useSearchParams()
  const paymentUrl = searchParams.get('url')

  useEffect(() => {
    if (paymentUrl) {
      console.log('🔄 Redirecting to:', paymentUrl)
      
      // Intentar redirección inmediata
      window.location.href = paymentUrl
    }
  }, [paymentUrl])

  if (!paymentUrl) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h1>Error</h1>
          <p>No se encontró la URL de pago</p>
          <a href="/checkout">Volver al checkout</a>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.spinner}></div>
        <h1 className={styles.title}>Redirigiendo al pago...</h1>
        <p className={styles.subtitle}>Serás redirigido a MercadoPago en unos segundos</p>
        
        <div className={styles.manual}>
          <p>¿No fuiste redirigido automáticamente?</p>
          <a 
            href={paymentUrl}
            className={styles.button}
            target="_self"
          >
            Click aquí para continuar
          </a>
        </div>
      </div>
    </div>
  )
}