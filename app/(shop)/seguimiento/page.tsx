"use client"
import { useState } from 'react'
import Container from '@/components/ui/Container'
import { Search, Package, CheckCircle, Truck, Clock, MapPin, Mail, Phone, ExternalLink } from 'lucide-react'
import styles from './page.module.css'
import Image from 'next/image'
import { calculateShipping, FREE_SHIPPING_THRESHOLD } from '@/lib/shipping/rates'

interface OrderItem {
  id: string
  product_name: string
  product_image?: string
  quantity: number
  unit_price: number
  total_price: number
  customization_details?: any
}

// ✅ Agregar interfaz de envío
interface ShipmentInfo {
  carrier: string
  tracking_number: string
  shipping_date: string
  estimated_delivery_date?: string
  notes?: string
}

interface OrderTracking {
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  shipping_address: string
  shipping_city: string
  shipping_state: string
  subtotal: number
  shipping_cost: number
  total: number
  status: string
  payment_status: string
  created_at: string
  paid_at?: string
  processing_at?: string
  shipped_at?: string
  delivered_at?: string
  items: OrderItem[]
  items_count: number
  shipment?: ShipmentInfo // ✅ Agregar información de envío
}

export default function SeguimientoPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState<OrderTracking | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setOrder(null)

    if (!orderNumber.trim() || !email.trim()) {
      setError('Por favor ingresa el número de orden y tu email')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/tracking?order_number=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`)

      if (!response.ok) {
        if (response.status === 404) {
          setError('No se encontró una orden con ese número y email')
        } else {
          setError('Error al buscar la orden')
        }
        return
      }

      const data = await response.json()
      setOrder(data)
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (date?: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusInfo = (status: string) => {
    const statuses: Record<string, { label: string; description: string; icon: any; color: string }> = {
      pending: {
        label: 'Pendiente',
        description: 'Tu orden está pendiente de confirmación de pago',
        icon: Clock,
        color: '#f59e0b'
      },
      paid: {
        label: 'Pagado',
        description: 'Tu pago ha sido confirmado',
        icon: CheckCircle,
        color: '#10b981'
      },
      processing: {
        label: 'Procesando',
        description: 'Estamos preparando tu pedido',
        icon: Package,
        color: '#3b82f6'
      },
      shipped: {
        label: 'Enviado',
        description: 'Tu pedido está en camino',
        icon: Truck,
        color: '#8b5cf6'
      },
      delivered: {
        label: 'Entregado',
        description: '¡Tu pedido ha sido entregado!',
        icon: CheckCircle,
        color: '#10b981'
      },
      cancelled: {
        label: 'Cancelado',
        description: 'Esta orden ha sido cancelada',
        icon: Clock,
        color: '#ef4444'
      }
    }
    return statuses[status] || statuses.pending
  }

  const statusInfo = order ? getStatusInfo(order.status) : null
  const StatusIcon = statusInfo?.icon

  return (
    <div className={styles.page}>
      <Container>
        <div className={styles.hero}>
          <h1 className={styles.title}>Rastrea tu Pedido</h1>
          <p className={styles.subtitle}>
            Ingresa tu número de orden y email para conocer el estado de tu pedido
          </p>
        </div>

        <div className={styles.searchCard}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Número de Orden
              </label>
              <div className={styles.inputWrapper}>
                <Package className={styles.inputIcon} size={20} />
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="NM-20251228-0001"
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Email
              </label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className={styles.input}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitButton}
            >
              <Search size={20} />
              {isLoading ? 'Buscando...' : 'Buscar Orden'}
            </button>
          </form>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}
        </div>

        {order && statusInfo && StatusIcon && (
          <div className={styles.resultCard}>
            {/* Header */}
            <div className={styles.resultHeader}>
              <div className={styles.orderInfo}>
                <h2 className={styles.orderNumber}>Orden {order.order_number}</h2>
                <p className={styles.orderDate}>Realizada el {formatDate(order.created_at)}</p>
              </div>
              <div
                className={styles.statusBadge}
                style={{ background: `${statusInfo.color}15`, color: statusInfo.color }}
              >
                <StatusIcon size={20} />
                {statusInfo.label}
              </div>
            </div>

            {/* Status Description */}
            <div className={styles.statusDescription}>
              <p>{statusInfo.description}</p>
            </div>

            {/* ✅ Información de Envío (si existe) */}
            {order.shipment && (order.status === 'shipped' || order.status === 'delivered') && (
              <div className={styles.shipmentInfo}>
                <div className={styles.shipmentHeader}>
                  <Truck size={20} />
                  <h3>Información de Envío</h3>
                </div>
                <div className={styles.shipmentDetails}>
                  <div className={styles.shipmentRow}>
                    <span className={styles.shipmentLabel}>Transportadora:</span>
                    <span className={styles.shipmentValue}>{order.shipment.carrier}</span>
                  </div>
                  <div className={styles.shipmentRow}>
                    <span className={styles.shipmentLabel}>Número de Guía:</span>
                    <span className={styles.shipmentValue}>
                      <strong>{order.shipment.tracking_number}</strong>
                    </span>
                  </div>
                  <div className={styles.shipmentRow}>
                    <span className={styles.shipmentLabel}>Fecha de Envío:</span>
                    <span className={styles.shipmentValue}>
                      {formatDate(order.shipment.shipping_date)}
                    </span>
                  </div>
                  {order.shipment.estimated_delivery_date && (
                    <div className={styles.shipmentRow}>
                      <span className={styles.shipmentLabel}>Entrega Estimada:</span>
                      <span className={styles.shipmentValue}>
                        {formatDate(order.shipment.estimated_delivery_date)}
                      </span>
                    </div>
                  )}
                  {order.shipment.notes && (
                    <div className={styles.shipmentNotes}>
                      <span className={styles.shipmentLabel}>Notas:</span>
                      <p>{order.shipment.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className={styles.timeline}>
              <div className={`${styles.timelineStep} ${styles.active}`}>
                <div className={styles.timelineIcon} style={{ background: '#10b981' }}>
                  <CheckCircle size={20} />
                </div>
                <div className={styles.timelineContent}>
                  <p className={styles.timelineLabel}>Orden Creada</p>
                  <p className={styles.timelineDate}>{formatDate(order.created_at)}</p>
                </div>
              </div>

              <div className={`${styles.timelineStep} ${order.paid_at ? styles.active : ''}`}>
                <div className={styles.timelineIcon} style={{ background: order.paid_at ? '#10b981' : '#e5e7eb' }}>
                  <CheckCircle size={20} />
                </div>
                <div className={styles.timelineContent}>
                  <p className={styles.timelineLabel}>Pago Confirmado</p>
                  <p className={styles.timelineDate}>{formatDate(order.paid_at)}</p>
                </div>
              </div>

              <div className={`${styles.timelineStep} ${order.processing_at || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? styles.active : ''}`}>
                <div className={styles.timelineIcon} style={{ background: order.processing_at || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? '#3b82f6' : '#e5e7eb' }}>
                  <Package size={20} />
                </div>
                <div className={styles.timelineContent}>
                  <p className={styles.timelineLabel}>Procesando</p>
                  <p className={styles.timelineDate}>{formatDate(order.processing_at)}</p>
                </div>
              </div>

              <div className={`${styles.timelineStep} ${order.shipped_at || order.status === 'shipped' || order.status === 'delivered' ? styles.active : ''}`}>
                <div className={styles.timelineIcon} style={{ background: order.shipped_at || order.status === 'shipped' || order.status === 'delivered' ? '#8b5cf6' : '#e5e7eb' }}>
                  <Truck size={20} />
                </div>
                <div className={styles.timelineContent}>
                  <p className={styles.timelineLabel}>Enviado</p>
                  <p className={styles.timelineDate}>{formatDate(order.shipped_at)}</p>
                  {/* ✅ Mostrar guía en timeline */}
                  {order.shipment && (
                    <p className={styles.trackingNumber}>
                      Guía: {order.shipment.tracking_number}
                    </p>
                  )}
                </div>
              </div>

              <div className={`${styles.timelineStep} ${order.delivered_at || order.status === 'delivered' ? styles.active : ''}`}>
                <div className={styles.timelineIcon} style={{ background: order.delivered_at || order.status === 'delivered' ? '#10b981' : '#e5e7eb' }}>
                  <CheckCircle size={20} />
                </div>
                <div className={styles.timelineContent}>
                  <p className={styles.timelineLabel}>Entregado</p>
                  <p className={styles.timelineDate}>{formatDate(order.delivered_at)}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className={styles.itemsSection}>
              <h3 className={styles.sectionTitle}>
                <Package size={20} />
                Productos Ordenados ({order.items_count})
              </h3>
              <div className={styles.itemsList}>
                {order.items.map((item) => (
                  <div key={item.id} className={styles.orderItem}>
                    <div className={styles.itemImage}>
                      {item.product_image ? (
                        <Image
                          src={item.product_image}
                          alt={item.product_name}
                          fill
                          className={styles.itemImg}
                          sizes="100px"
                        />
                      ) : (
                        <div className={styles.itemPlaceholder}>
                          💎
                        </div>
                      )}
                    </div>
                    <div className={styles.itemInfo}>
                      <h4 className={styles.itemName}>{item.product_name}</h4>
                      {item.customization_details && Array.isArray(item.customization_details) && item.customization_details.length > 0 && (
                        <div className={styles.customizations}>
                          {item.customization_details.map((custom: any, idx: number) => (
                            <span key={idx} className={styles.customBadge}>
                              {custom.optionName}: {custom.valueName}
                              {custom.additionalPrice > 0 && (
                                <span className={styles.customPrice}>
                                  +{formatPrice(custom.additionalPrice)}
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className={styles.itemPricing}>
                        <span className={styles.itemQuantity}>Cantidad: {item.quantity}</span>
                        <span className={styles.itemPrice}>
                          {formatPrice(Number(item.unit_price))} c/u
                        </span>
                      </div>
                    </div>
                    <div className={styles.itemTotal}>
                      {formatPrice(Number(item.total_price))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Details */}
            <div className={styles.details}>
              <div className={styles.detailSection}>
                <h3 className={styles.detailTitle}>
                  <MapPin size={18} />
                  Dirección de Envío
                </h3>
                <p className={styles.detailText}>{order.shipping_address}</p>
                <p className={styles.detailText}>{order.shipping_city}, {order.shipping_state}</p>
              </div>

              <div className={styles.detailSection}>
                <h3 className={styles.detailTitle}>
                  <Package size={18} />
                  Resumen del Pedido
                </h3>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>{formatPrice(Number(order.subtotal))}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Envío</span>
                  <span>
                    {order.shipping_cost === 0 
                      ? 'GRATIS' 
                      : formatPrice(Number(order.shipping_cost))}
                  </span>
                </div>
                <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                  <span>Total</span>
                  <span>{formatPrice(Number(order.total))}</span>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className={styles.contact}>
              <p className={styles.contactText}>
                ¿Necesitas ayuda con tu pedido?
              </p>
              <a href="/contacto" className={styles.contactButton}>
                Contáctanos
              </a>
            </div>
          </div>
        )}
      </Container>
    </div>
  )
}