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

export default function PurchaseTracking({ orderId, orderNumber, total, items }: PurchaseTrackingProps) {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      // Evento de purchase para Google Ads y GA4
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

      console.log('✅ Purchase event tracked:', {
        transaction_id: orderId,
        value: total,
        items_count: items.length,
      })
    }
  }, [orderId, total, items])

  return null
}
