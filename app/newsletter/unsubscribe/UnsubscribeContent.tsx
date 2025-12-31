"use client"

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Container from '@/components/ui/Container'
import styles from './page.module.css'

export default function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  
  const [isUnsubscribing, setIsUnsubscribing] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleUnsubscribe = async () => {
    if (!email) {
      setStatus('error')
      setMessage('Email no proporcionado')
      return
    }

    setIsUnsubscribing(true)

    try {
      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al desuscribirse')
      }

      setStatus('success')
      setMessage('Te has desuscrito exitosamente del newsletter')
    } catch (error: any) {
      setStatus('error')
      setMessage(error.message || 'Hubo un error al desuscribirse')
    } finally {
      setIsUnsubscribing(false)
    }
  }

  return (
    <div className={styles.page}>
      <Container>
        <div className={styles.container}>
          {status === 'idle' && (
            <>
              <h1 className={styles.title}>Desuscribirse del Newsletter</h1>
              <p className={styles.text}>
                ¿Estás seguro de que quieres desuscribirte de nuestro newsletter?
              </p>
              {email && (
                <p className={styles.email}>{email}</p>
              )}
              <p className={styles.info}>
                Ya no recibirás actualizaciones sobre nuevos productos, ofertas exclusivas ni tips sobre joyas.
              </p>
              <div className={styles.actions}>
                <button
                  onClick={handleUnsubscribe}
                  disabled={isUnsubscribing}
                  className={styles.unsubscribeButton}
                >
                  {isUnsubscribing ? 'Procesando...' : 'Sí, desuscribirme'}
                </button>
                <Link href="/" className={styles.cancelButton}>
                  No, mantener suscripción
                </Link>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className={styles.icon}>✅</div>
              <h1 className={styles.title}>¡Listo!</h1>
              <p className={styles.text}>{message}</p>
              <p className={styles.info}>
                Lamentamos verte partir. Si cambias de opinión, siempre puedes suscribirte de nuevo desde nuestra página.
              </p>
              <Link href="/" className={styles.homeButton}>
                Volver al inicio
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className={styles.icon}>❌</div>
              <h1 className={styles.title}>Error</h1>
              <p className={styles.text}>{message}</p>
              <Link href="/" className={styles.homeButton}>
                Volver al inicio
              </Link>
            </>
          )}
        </div>
      </Container>
    </div>
  )
}