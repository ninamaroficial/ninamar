"use client"

import { useEffect, useState } from "react"
import { CheckCircle } from "lucide-react"
import styles from "./CartToast.module.css"

interface CartToastProps {
  show: boolean
  productName: string
}

export default function CartToast({ show, productName }: CartToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [show])

  if (!isVisible) return null

  return (
    <div className={styles.toast}>
      <CheckCircle className={styles.icon} />
      <div className={styles.content}>
        <p className={styles.title}>¡Agregado al carrito!</p>
        <p className={styles.product}>{productName}</p>
      </div>
    </div>
  )
}