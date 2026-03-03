'use client'

import { useEffect } from 'react'

interface PurchaseTrackingProps {
  orderId: string
  orderNumber: string
  total: number
  items: Array<{
    product_id: string
    product_name: string
    quantity: number
    unit_price: number
  }>
}

// Declaración de tipos para gtag
declare global {
  interface Window {
    gtag?: (command: string, ...args: any[]) => void;
  }
}

export default function PurchaseTracking({ orderId, orderNumber, total, items }: PurchaseTrackingProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Evento para Google Tag Manager
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'purchase',
        transaction_id: orderId,
        value: total,
        currency: 'COP',
        items: items.map((item) => ({
          item_id: item.product_id,
          item_name: item.product_name,
          quantity: item.quantity,
          price: item.unit_price,
        })),
      })

      console.log('✅ GTM Purchase event tracked:', {
        transaction_id: orderId,
        value: total,
        items_count: items.length,
      })
    }

    // Evento de conversión para Google Ads
    if (window.gtag) {
      window.gtag('event', 'conversion', {
        'send_to': 'AW-17848799423',
        'value': total,
        'currency': 'COP',
        'transaction_id': orderId
      })

      console.log('✅ Google Ads conversion tracked:', {
        transaction_id: orderId,
        value: total,
      })
    }
  }, [orderId, total, items])

  return null
}
