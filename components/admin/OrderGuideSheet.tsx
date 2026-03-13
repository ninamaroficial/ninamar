import { forwardRef } from 'react'
import Image from 'next/image'
import styles from './OrderGuideSheet.module.css'

type CustomizationDetail = {
  optionName?: string
  valueName?: string
}

type OrderGuideItem = {
  id: string
  product_name: string
  quantity: number
  total_price: number
  customization_details?: CustomizationDetail[]
}

export type OrderGuideOrder = {
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
  customer_notes?: string
  created_at: string
  order_items: OrderGuideItem[]
}

type OrderGuideSheetProps = {
  order: OrderGuideOrder
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const OrderGuideSheet = forwardRef<HTMLElement, OrderGuideSheetProps>(function OrderGuideSheet({ order }, ref) {
  return (
    <article ref={ref} className={styles.sheet}>
      <div className={styles.watermarkTopLeft}>DELICADO</div>
      <div className={styles.watermarkTopRight}>DELICADO</div>
      <div className={styles.watermarkCenter}>DELICADO</div>
      <div className={styles.watermarkBottomLeft}>DELICADO</div>
      <div className={styles.watermarkBottomRight}>DELICADO</div>
      <header className={styles.header}>
        <div className={styles.brandGroup}>
          <div className={styles.logoWrap}>
            <Image
              src="/logo.png"
              alt="Niñamar"
              fill
              className={styles.logoImage}
              sizes="52px"
              priority
            />
          </div>
          <div>
            <p className={styles.brand}>Niñamar</p>
            <h1 className={styles.title}>Guía de Pedido</h1>
            <p className={styles.subtitle}>Documento de alistamiento para envío</p>
          </div>
        </div>
        <div className={styles.orderMeta}>
          <p className={styles.orderNumber}>{order.order_number}</p>
          <p className={styles.orderDate}>{formatDate(order.created_at)}</p>
        </div>
      </header>

      <div className={styles.grid}>
        <section className={styles.block}>
          <h2>Cliente</h2>
          <p><strong>{order.customer_name}</strong></p>
          <p>{order.customer_phone || 'Sin teléfono'}</p>
          <p>{order.customer_email}</p>
          {order.customer_document && <p>Doc: {order.customer_document}</p>}
        </section>

        <section className={styles.block}>
          <h2>Envío</h2>
          <p>{order.shipping_address}</p>
          <p>{order.shipping_city}, {order.shipping_state}</p>
          {order.shipping_zip && <p>CP: {order.shipping_zip}</p>}
        </section>
      </div>

      <section className={styles.itemsBlock}>
        <h2>Productos ({order.order_items.length})</h2>
        <div className={styles.itemsList}>
          {order.order_items.map((item) => (
            <div key={item.id} className={styles.itemRow}>
              <div>
                <p className={styles.itemName}>{item.quantity}x {item.product_name}</p>
                {Array.isArray(item.customization_details) && item.customization_details.length > 0 && (
                  <p className={styles.itemCustomizations}>
                    {item.customization_details
                      .map((detail) => `${detail.optionName || 'Opción'}: ${detail.valueName || '-'}`)
                      .join(' • ')}
                  </p>
                )}
              </div>
              <p className={styles.itemPrice}>{formatPrice(item.total_price)}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.totals}>
          <p>Subtotal: <strong>{formatPrice(order.subtotal)}</strong></p>
          <p>Envío: <strong>{formatPrice(order.shipping_cost)}</strong></p>
          <p className={styles.totalFinal}>Total: <strong>{formatPrice(order.total)}</strong></p>
        </div>
      </footer>

      {order.customer_notes && (
        <div className={styles.notes}>
          <strong>Notas del cliente:</strong> {order.customer_notes}
        </div>
      )}
    </article>
  )
})

export default OrderGuideSheet