"use client"

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ShipmentModal from '@/components/admin/ShipmentModal' // ← IMPORTAR
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle,
  Truck,
  Mail,
  Phone,
  Calendar,
  Edit
} from 'lucide-react'
import styles from './page.module.css'

interface OrderItem {
  id: string
  product_name: string
  product_image?: string
  base_price: number
  quantity: number
  unit_price: number
  total_price: number
  customization_details?: any
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
  payment_id?: string
  customer_notes?: string
  created_at: string
  paid_at?: string
  processing_at?: string  // ← Agregar
  shipped_at?: string
  delivered_at?: string
  order_items: OrderItem[]
}

export default function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('')
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false)
  const canUpdateStatus = order?.payment_status === 'approved'
  const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false) // ← AGREGAR
  const [pendingStatus, setPendingStatus] = useState<string | null>(null) 
  
  useEffect(() => {
    loadOrder()
  }, [resolvedParams.orderId])

  const loadOrder = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${resolvedParams.orderId}`)
      if (!res.ok) throw new Error('Order not found')
      const data = await res.json()
      setOrder(data)
      setSelectedStatus(data.status)
      setSelectedPaymentStatus(data.payment_status)
    } catch (error) {
      console.error('Error loading order:', error)
      alert('Error al cargar la orden')
      router.push('/admin')
    } finally {
      setIsLoading(false)
    }
  }

// ✅ Función actualizada para manejar actualización de estado
const handleUpdateStatus = async () => {
  if (!order || selectedStatus === order.status || !canUpdateStatus) return

  // ✅ Si es "shipped", abrir modal primero
  if (selectedStatus === 'shipped') {
    setPendingStatus(selectedStatus)
    setIsShipmentModalOpen(true)
    return
  }

  // Para otros estados, actualizar directamente
  setIsUpdating(true)
  try {
    const res = await fetch(`/api/admin/orders/${resolvedParams.orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: selectedStatus })
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Update failed')
    }

    alert('Estado actualizado correctamente')
    await loadOrder()
  } catch (error: any) {
    console.error('Error updating status:', error)
    alert(error.message || 'Error al actualizar el estado')
  } finally {
    setIsUpdating(false)
  }
}

const handleUpdatePaymentStatus = async () => {
  if (!order || selectedPaymentStatus === order.payment_status) return

  setIsUpdatingPayment(true)
  try {
    const res = await fetch(`/api/admin/orders/${resolvedParams.orderId}/payment-status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_status: selectedPaymentStatus })
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Error al actualizar estado de pago')
    }

    alert('Estado de pago actualizado correctamente')
    await loadOrder()
  } catch (error: any) {
    console.error('Error updating payment status:', error)
    alert(error.message || 'Error al actualizar el estado de pago')
  } finally {
    setIsUpdatingPayment(false)
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
    return new Date(date).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleStatusChange = async (newStatus: string) => {
    // ✅ Si el estado es "shipped", abrir modal primero
    if (newStatus === 'shipped') {
      setPendingStatus(newStatus)
      setIsShipmentModalOpen(true)
      return
    }

    // Para otros estados, actualizar directamente
    await updateStatus(newStatus, undefined)
  }
// ✅ Función para manejar envío del modal
const handleShipmentSubmit = async (shipmentData: any) => {
  if (!order || !pendingStatus) return

  setIsUpdating(true)
  try {
    const res = await fetch(`/api/admin/orders/${resolvedParams.orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        status: pendingStatus,
        shipmentData: shipmentData
      })
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Error al actualizar estado')
    }

    alert('Estado actualizado y envío registrado correctamente')
    setIsShipmentModalOpen(false)
    setPendingStatus(null)
    await loadOrder()
  } catch (error: any) {
    console.error('Error updating status:', error)
    alert(error.message || 'Error al actualizar el estado')
  } finally {
    setIsUpdating(false)
  }
}

const updateStatus = async (newStatus: string, shipmentData?: any) => {
  setIsUpdating(true) // ✅ Cambiar setIsUpdatingStatus -> setIsUpdating
  // ❌ Remover setUpdateError (no existe en tu código)
  
  try {
    const payload: any = { status: newStatus }
    
    if (shipmentData) {
      payload.shipmentData = shipmentData
    }

    const response = await fetch(`/api/admin/orders/${resolvedParams.orderId}`, { // ✅ Cambiar params -> resolvedParams y usar paréntesis normales
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar estado')
    }

    // Actualizar estado local
    setOrder(data)
    setSelectedStatus(newStatus)
    
    alert('Estado actualizado correctamente') // ✅ Agregar feedback al usuario
    await loadOrder() // ✅ Recargar datos
    
  } catch (error: any) {
    console.error('Error updating status:', error)
    alert(error.message || 'Error al actualizar el estado') // ✅ Mostrar error al usuario
  } finally {
    setIsUpdating(false)
  }
}

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string; icon: any }> = {
      pending: { label: 'Pendiente', className: styles.statusPending, icon: Clock },
      paid: { label: 'Pagado', className: styles.statusPaid, icon: CheckCircle },
      processing: { label: 'Procesando', className: styles.statusProcessing, icon: Package },
      shipped: { label: 'Enviado', className: styles.statusShipped, icon: Truck },
      delivered: { label: 'Entregado', className: styles.statusDelivered, icon: CheckCircle },
      cancelled: { label: 'Cancelado', className: styles.statusCancelled, icon: Clock }
    }
    const badge = badges[status] || { label: status, className: '', icon: Clock }
    const Icon = badge.icon
    return (
      <span className={`${styles.badge} ${badge.className}`}>
        <Icon size={16} />
        {badge.label}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Cargando orden...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>Orden no encontrada</div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/admin" className={styles.backButton}>
            <ArrowLeft size={20} />
            Volver al Dashboard
          </Link>
          <div className={styles.headerInfo}>
            <h1 className={styles.orderNumber}>Orden {order.order_number}</h1>
            {getStatusBadge(order.status)}
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.layout}>
          {/* Main Content */}
          <div className={styles.mainContent}>
            {/* Payment Status Update */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <CreditCard size={20} />
                <h2 className={styles.cardTitle}>Estado de Pago</h2>
              </div>
              <div className={styles.statusUpdate}>
                <select
                  value={selectedPaymentStatus}
                  onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                  className={styles.statusSelect}
                >
                  <option value="pending">Pendiente</option>
                  <option value="approved">Aprobado</option>
                  <option value="rejected">Rechazado</option>
                </select>
                <button
                  onClick={handleUpdatePaymentStatus}
                  disabled={isUpdatingPayment || selectedPaymentStatus === order.payment_status}
                  className={styles.updateButton}
                >
                  {isUpdatingPayment ? 'Actualizando...' : 'Actualizar Pago'}
                </button>
              </div>
              {order.payment_status === 'pending' && (
                <p className={styles.paymentHint}>
                  💡 Marca el pago como "Aprobado" una vez que confirmes que el cliente ha realizado el pago.
                </p>
              )}
            </div>

            {/* Status Update */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <Edit size={20} />
                <h2 className={styles.cardTitle}>Actualizar Estado</h2>
              </div>

              {!canUpdateStatus ? (
                <div className={styles.statusBlocked}>
                  <div className={styles.blockedIcon}>⚠️</div>
                  <div className={styles.blockedContent}>
                    <h3 className={styles.blockedTitle}>
                      {order.payment_status === 'pending'
                        ? 'Pago Pendiente'
                        : 'Pago Rechazado'}
                    </h3>
                    <p className={styles.blockedText}>
                      {order.payment_status === 'pending'
                        ? 'No puedes actualizar el estado de esta orden hasta que el pago sea confirmado.'
                        : 'Esta orden no se puede procesar porque el pago fue rechazado. Contacta al cliente para resolver el problema.'}
                    </p>
                    {order.payment_status === 'rejected' && (
                      <div className={styles.blockedActions}>
                        <a
                          href={`mailto:${order.customer_email}?subject=Problema con tu orden ${order.order_number}`}
                          className={styles.contactButton}
                        >
                          Contactar Cliente
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className={styles.statusUpdate}>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className={styles.statusSelect}
                  >
                    <option value="paid">Pagado</option>
                    <option value="processing">Procesando</option>
                    <option value="shipped">Enviado</option>
                    <option value="delivered">Entregado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                  <button
                    onClick={handleUpdateStatus}
                    disabled={isUpdating || selectedStatus === order.status}
                    className={styles.updateButton}
                  >
                    {isUpdating ? 'Actualizando...' : 'Actualizar Estado'}
                  </button>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <Calendar size={20} />
                <h2 className={styles.cardTitle}>Línea de Tiempo</h2>
              </div>
              <div className={styles.timeline}>
                {/* Orden Creada */}
                <div className={styles.timelineItem}>
                  <div className={`${styles.timelineIcon} ${styles.active}`}>
                    <CheckCircle size={20} />
                  </div>
                  <div className={styles.timelineContent}>
                    <p className={styles.timelineLabel}>Orden Creada</p>
                    <p className={styles.timelineDate}>{formatDate(order.created_at)}</p>
                  </div>
                </div>

                {/* Pago Confirmado */}
                {order.paid_at ? (
                  <div className={styles.timelineItem}>
                    <div className={`${styles.timelineIcon} ${styles.active}`}>
                      <CreditCard size={20} />
                    </div>
                    <div className={styles.timelineContent}>
                      <p className={styles.timelineLabel}>Pago Confirmado</p>
                      <p className={styles.timelineDate}>{formatDate(order.paid_at)}</p>
                    </div>
                  </div>
                ) : (
                  <div className={styles.timelineItem}>
                    <div className={styles.timelineIcon}>
                      <CreditCard size={20} />
                    </div>
                    <div className={styles.timelineContent}>
                      <p className={styles.timelineLabel}>Pago Pendiente</p>
                      <p className={styles.timelineDate}>Esperando confirmación</p>
                    </div>
                  </div>
                )}

                {/* Procesando */}
                {order.processing_at ? (
                  <div className={styles.timelineItem}>
                    <div className={`${styles.timelineIcon} ${styles.active}`}>
                      <Package size={20} />
                    </div>
                    <div className={styles.timelineContent}>
                      <p className={styles.timelineLabel}>Orden en Proceso</p>
                      <p className={styles.timelineDate}>{formatDate(order.processing_at)}</p>
                    </div>
                  </div>
                ) : (order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') ? (
                  <div className={styles.timelineItem}>
                    <div className={`${styles.timelineIcon} ${styles.active}`}>
                      <Package size={20} />
                    </div>
                    <div className={styles.timelineContent}>
                      <p className={styles.timelineLabel}>Orden en Proceso</p>
                      <p className={styles.timelineDate}>Procesando actualmente</p>
                    </div>
                  </div>
                ) : (
                  <div className={styles.timelineItem}>
                    <div className={styles.timelineIcon}>
                      <Package size={20} />
                    </div>
                    <div className={styles.timelineContent}>
                      <p className={styles.timelineLabel}>Procesamiento</p>
                      <p className={styles.timelineDate}>Pendiente</p>
                    </div>
                  </div>
                )}

                {/* Enviado */}
                {order.shipped_at ? (
                  <div className={styles.timelineItem}>
                    <div className={`${styles.timelineIcon} ${styles.active}`}>
                      <Truck size={20} />
                    </div>
                    <div className={styles.timelineContent}>
                      <p className={styles.timelineLabel}>Orden Enviada</p>
                      <p className={styles.timelineDate}>{formatDate(order.shipped_at)}</p>
                    </div>
                  </div>
                ) : (order.status === 'shipped' || order.status === 'delivered') ? (
                  <div className={styles.timelineItem}>
                    <div className={`${styles.timelineIcon} ${styles.active}`}>
                      <Truck size={20} />
                    </div>
                    <div className={styles.timelineContent}>
                      <p className={styles.timelineLabel}>Orden Enviada</p>
                      <p className={styles.timelineDate}>Recientemente enviada</p>
                    </div>
                  </div>
                ) : (
                  <div className={styles.timelineItem}>
                    <div className={styles.timelineIcon}>
                      <Truck size={20} />
                    </div>
                    <div className={styles.timelineContent}>
                      <p className={styles.timelineLabel}>Envío</p>
                      <p className={styles.timelineDate}>Pendiente</p>
                    </div>
                  </div>
                )}

                {/* Entregado */}
                {order.delivered_at ? (
                  <div className={styles.timelineItem}>
                    <div className={`${styles.timelineIcon} ${styles.active}`}>
                      <CheckCircle size={20} />
                    </div>
                    <div className={styles.timelineContent}>
                      <p className={styles.timelineLabel}>Orden Entregada</p>
                      <p className={styles.timelineDate}>{formatDate(order.delivered_at)}</p>
                    </div>
                  </div>
                ) : order.status === 'delivered' ? (
                  <div className={styles.timelineItem}>
                    <div className={`${styles.timelineIcon} ${styles.active}`}>
                      <CheckCircle size={20} />
                    </div>
                    <div className={styles.timelineContent}>
                      <p className={styles.timelineLabel}>Orden Entregada</p>
                      <p className={styles.timelineDate}>Recientemente entregada</p>
                    </div>
                  </div>
                ) : (
                  <div className={styles.timelineItem}>
                    <div className={styles.timelineIcon}>
                      <CheckCircle size={20} />
                    </div>
                    <div className={styles.timelineContent}>
                      <p className={styles.timelineLabel}>Entrega</p>
                      <p className={styles.timelineDate}>Pendiente</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Order Items */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <Package size={20} />
                <h2 className={styles.cardTitle}>Productos ({order.order_items?.length || 0})</h2>
              </div>
              <div className={styles.items}>
                {order.order_items?.map((item) => (
                  <div key={item.id} className={styles.item}>
                    <div className={styles.itemImage}>
                      {item.product_image ? (
                        <Image
                          src={item.product_image}
                          alt={item.product_name}
                          fill
                          className={styles.image}
                          sizes="120px"
                        />
                      ) : (
                        <div className={styles.imagePlaceholder}>💎</div>
                      )}
                    </div>
                    <div className={styles.itemDetails}>
                      <h3 className={styles.itemName}>{item.product_name}</h3>

                      {/* Customizations */}
                      {item.customization_details && Array.isArray(item.customization_details) && (
                        <div className={styles.customizations}>
                          {item.customization_details.map((custom: any, idx: number) => (
                            <div key={idx} className={styles.customization}>
                              <span className={styles.customLabel}>{custom.optionName}:</span>
                              <span className={styles.customValue}>{custom.valueName}</span>
                              {custom.additionalPrice > 0 && (
                                <span className={styles.customPrice}>
                                  +{formatPrice(custom.additionalPrice)}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className={styles.itemPricing}>
                        <span className={styles.itemQuantity}>Cantidad: {item.quantity}</span>
                        <span className={styles.itemUnitPrice}>
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

              {/* Totals */}
              <div className={styles.totals}>
                <div className={styles.totalRow}>
                  <span>Subtotal</span>
                  <span>{formatPrice(Number(order.subtotal))}</span>
                </div>
                <div className={styles.totalRow}>
                  <span>Envío</span>
                  <span>{order.shipping_cost > 0 ? formatPrice(Number(order.shipping_cost)) : 'Gratis'}</span>
                </div>
                <div className={`${styles.totalRow} ${styles.totalFinal}`}>
                  <span>Total</span>
                  <span>{formatPrice(Number(order.total))}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className={styles.sidebar}>
            {/* Customer Info */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <User size={20} />
                <h2 className={styles.cardTitle}>Cliente</h2>
              </div>
              <div className={styles.customerInfo}>
                <div className={styles.infoRow}>
                  <User size={16} className={styles.infoIcon} />
                  <span className={styles.infoText}>{order.customer_name}</span>
                </div>
                <div className={styles.infoRow}>
                  <Mail size={16} className={styles.infoIcon} />
                  <a href={`mailto:${order.customer_email}`} className={styles.infoLink}>
                    {order.customer_email}
                  </a>
                </div>
                {order.customer_phone && (
                  <div className={styles.infoRow}>
                    <Phone size={16} className={styles.infoIcon} />
                    <a href={`tel:${order.customer_phone}`} className={styles.infoLink}>
                      {order.customer_phone}
                    </a>
                  </div>
                )}
                {order.customer_document && (
                  <div className={styles.infoRow}>
                    <CreditCard size={16} className={styles.infoIcon} />
                    <span className={styles.infoText}>CC: {order.customer_document}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Info */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <MapPin size={20} />
                <h2 className={styles.cardTitle}>Dirección de Envío</h2>
              </div>
              <div className={styles.shippingInfo}>
                <p className={styles.address}>{order.shipping_address}</p>
                <p className={styles.city}>
                  {order.shipping_city}, {order.shipping_state}
                </p>
                {order.shipping_zip && (
                  <p className={styles.zip}>CP: {order.shipping_zip}</p>
                )}
                <p className={styles.country}>Colombia</p>
              </div>
            </div>

            {/* Payment Info */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <CreditCard size={20} />
                <h2 className={styles.cardTitle}>Información de Pago</h2>
              </div>
              <div className={styles.paymentInfo}>
                <div className={styles.paymentRow}>
                  <span className={styles.paymentLabel}>Estado:</span>
                  <span className={`${styles.paymentBadge} ${order.payment_status === 'approved' ? styles.paymentApproved :
                    order.payment_status === 'rejected' ? styles.paymentRejected :
                      styles.paymentPending
                    }`}>
                    {order.payment_status === 'approved' ? 'Aprobado' :
                      order.payment_status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                  </span>
                </div>
                {order.payment_method && (
                  <div className={styles.paymentRow}>
                    <span className={styles.paymentLabel}>Método:</span>
                    <span className={styles.paymentText}>{order.payment_method}</span>
                  </div>
                )}
                {order.payment_id && (
                  <div className={styles.paymentRow}>
                    <span className={styles.paymentLabel}>ID:</span>
                    <span className={styles.paymentText}>{order.payment_id}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {order.customer_notes && (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <Package size={20} />
                  <h2 className={styles.cardTitle}>Notas del Cliente</h2>
                </div>
                <p className={styles.notes}>{order.customer_notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ShipmentModal
        isOpen={isShipmentModalOpen}
        onClose={() => {
          setIsShipmentModalOpen(false)
          setPendingStatus(null)
        }}
        onSubmit={handleShipmentSubmit}
        orderNumber={order?.order_number || ''}
      />
    </div>
  )
}