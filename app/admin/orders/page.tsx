"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Filter, Package, Plus, Search } from 'lucide-react'
import CreateOrderModal from '@/components/admin/CreateOrderModal'
import styles from './page.module.css'

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  total: number
  status: string
  payment_status: string
  created_at: string
  items_count: number
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')

  useEffect(() => {
    loadOrders()
  }, [statusFilter, paymentFilter])

  const loadOrders = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (paymentFilter) params.append('payment_status', paymentFilter)
      if (searchQuery) params.append('search', searchQuery)
      params.append('limit', '30')

      const response = await fetch(`/api/admin/orders?${params}`)
      const payload = await response.json()
      setOrders(Array.isArray(payload.orders) ? payload.orders : [])
    } catch (error) {
      console.error('Error loading orders:', error)
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    loadOrders()
  }

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pendiente', className: styles.statusPending },
      paid: { label: 'Pagado', className: styles.statusPaid },
      processing: { label: 'Procesando', className: styles.statusProcessing },
      shipped: { label: 'Enviado', className: styles.statusShipped },
      delivered: { label: 'Entregado', className: styles.statusDelivered },
      cancelled: { label: 'Cancelado', className: styles.statusCancelled },
    }

    const badge = badges[status] || { label: status, className: '' }
    return <span className={`${styles.badge} ${badge.className}`}>{badge.label}</span>
  }

  const getPaymentBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pendiente', className: styles.paymentPending },
      approved: { label: 'Aprobado', className: styles.paymentApproved },
      rejected: { label: 'Rechazado', className: styles.paymentRejected },
    }

    const badge = badges[status] || { label: status, className: '' }
    return <span className={`${styles.badge} ${badge.className}`}>{badge.label}</span>
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.heading}>
          <div>
            <h1 className={styles.title}>Pedidos</h1>
            <p className={styles.subtitle}>Lista operativa de pedidos con búsqueda y filtros.</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className={styles.createButton}>
            <Plus size={18} />
            Crear Orden Manual
          </button>
        </div>

        <div className={styles.filtersSection}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchWrapper}>
              <Search className={styles.searchIcon} size={20} />
              <input
                type="text"
                placeholder="Buscar por número de orden, nombre o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <button type="submit" className={styles.searchButton}>
              Buscar
            </button>
          </form>

          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <Filter size={18} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="paid">Pagado</option>
                <option value="processing">Procesando</option>
                <option value="shipped">Enviado</option>
                <option value="delivered">Entregado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <Filter size={18} />
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">Todos los pagos</option>
                <option value="pending">Pendiente</option>
                <option value="approved">Aprobado</option>
                <option value="rejected">Rechazado</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <div>
              <h2 className={styles.tableTitle}>Órdenes recientes</h2>
              <p className={styles.tableSubtitle}>{orders.length} órdenes encontradas</p>
            </div>
          </div>

          {isLoading ? (
            <div className={styles.loading}>Cargando órdenes...</div>
          ) : orders.length === 0 ? (
            <div className={styles.emptyState}>
              <Package size={48} className={styles.emptyIcon} />
              <p className={styles.emptyText}>No se encontraron órdenes</p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Número de Orden</th>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Items</th>
                    <th>Estado</th>
                    <th>Pago</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <span className={styles.orderNumber}>{order.order_number}</span>
                      </td>
                      <td>
                        <div className={styles.customerInfo}>
                          <p className={styles.customerName}>{order.customer_name}</p>
                          <p className={styles.customerEmail}>{order.customer_email}</p>
                        </div>
                      </td>
                      <td>
                        <span className={styles.orderTotal}>{formatPrice(Number(order.total))}</span>
                      </td>
                      <td>
                        <span className={styles.itemsCount}>
                          {order.items_count} {order.items_count === 1 ? 'item' : 'items'}
                        </span>
                      </td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td>{getPaymentBadge(order.payment_status)}</td>
                      <td>
                        <span className={styles.orderDate}>{formatDate(order.created_at)}</span>
                      </td>
                      <td>
                        <Link href={`/admin/orders/${order.id}`} className={styles.viewButton}>
                          Ver Detalles
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <CreateOrderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false)
          loadOrders()
        }}
      />
    </div>
  )
}
