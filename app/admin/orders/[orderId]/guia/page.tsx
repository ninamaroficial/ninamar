"use client"

import { use, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Printer, Download, Copy, Check } from 'lucide-react'
import OrderGuideSheet from '@/components/admin/OrderGuideSheet'
import { copyElementAsImage } from '@/lib/copy-element-as-image'
import styles from './page.module.css'

interface OrderItem {
  id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  customization_details?: Array<{
    optionName?: string
    valueName?: string
  }>
}

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  customer_document?: string
  shipping_address: string
  shipping_city: string
  shipping_state: string
  shipping_zip?: string
  subtotal: number
  shipping_cost: number
  total: number
  status: string
  payment_status: string
  payment_method?: string
  customer_notes?: string
  created_at: string
  order_items: OrderItem[]
}

export default function OrderGuidePage({ params }: { params: Promise<{ orderId: string }> }) {
  const resolvedParams = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCopying, setIsCopying] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sheetRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const res = await fetch(`/api/admin/orders/${resolvedParams.orderId}`)
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }))
          throw new Error(errorData.error || `Error ${res.status}: No se pudo cargar la orden`)
        }
        const data = await res.json()
        setOrder(data)
        setError(null)
      } catch (error: any) {
        console.error('Error loading order guide:', error)
        setError(error.message || 'Error al cargar la guía de pedido')
      } finally {
        setIsLoading(false)
      }
    }

    loadOrder()
  }, [resolvedParams.orderId])

  const handlePrint = () => {
    window.print()
  }

  const handleCopyAsImage = async () => {
    if (!sheetRef.current || isCopying) return

    setIsCopying(true)
    setCopySuccess(false)

    try {
      await copyElementAsImage(sheetRef.current, { expandContent: true })
      setCopySuccess(true)
      window.setTimeout(() => setCopySuccess(false), 2200)
    } catch (error: any) {
      console.error('Error copying guide as image:', error)
      alert(error.message || 'No se pudo copiar la guía como imagen')
    } finally {
      setIsCopying(false)
    }
  }

  if (isLoading) {
    return <div className={styles.loading}>Cargando guía...</div>
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>
  }

  if (!order) {
    return <div className={styles.error}>No se pudo generar la guía de pedido.</div>
  }

  return (
    <div className={styles.page}>
      <div className={`${styles.toolbar} ${styles.noPrint}`}>
        <Link href={`/admin/orders/${order.id}`} className={styles.backButton}>
          <ArrowLeft size={18} />
          Volver a la orden
        </Link>
        <button onClick={handleCopyAsImage} className={styles.copyButton} disabled={isCopying}>
          {copySuccess ? <Check size={18} /> : <Copy size={18} />}
          {copySuccess ? 'Copiado' : isCopying ? 'Copiando...' : 'Copiar como imagen'}
        </button>
        <button onClick={handlePrint} className={styles.printButton}>
          <Download size={18} />
          Descargar PDF
        </button>
        <button onClick={handlePrint} className={styles.printButtonSecondary}>
          <Printer size={18} />
          Imprimir
        </button>
      </div>

      <OrderGuideSheet ref={sheetRef} order={order} />
    </div>
  )
}
