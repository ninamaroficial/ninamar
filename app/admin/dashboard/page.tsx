"use client"
import { Settings } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ShoppingBag,
  DollarSign,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Search,
  LogOut,
  Filter
} from 'lucide-react'
import styles from './page.module.css'

interface Stats {
  total_orders: number
  pending_orders: number
  paid_orders: number
  processing_orders: number
  shipped_orders: number
  delivered_orders: number
  total_revenue: number
  today_orders: number
  today_revenue: number
}

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  total: number
  status: string
  payment_status: string
  payment_method?: string
  created_at: string
  items_count: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')

  useEffect(() => {
    loadData()
  }, [statusFilter, paymentFilter])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Cargar estadísticas
      const statsRes = await fetch('/api/admin/stats')
      const statsData = await statsRes.json()
      setStats(statsData)

      // Cargar órdenes
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (paymentFilter) params.append('payment_status', paymentFilter)
      if (searchQuery) params.append('search', searchQuery)
      params.append('limit', '20')

      const ordersRes = await fetch(`/api/admin/orders?${params}`)
      const ordersData = await ordersRes.json()
      setOrders(ordersData.orders)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadData()
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pendiente', className: styles.statusPending },
      paid: { label: 'Pagado', className: styles.statusPaid },
      processing: { label: 'Procesando', className: styles.statusProcessing },
      shipped: { label: 'Enviado', className: styles.statusShipped },
      delivered: { label: 'Entregado', className: styles.statusDelivered },
      cancelled: { label: 'Cancelado', className: styles.statusCancelled }
    }
    const badge = badges[status] || { label: status, className: '' }
    return <span className={`${styles.badge} ${badge.className}`}>{badge.label}</span>
  }

  const getPaymentBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pendiente', className: styles.paymentPending },
      approved: { label: 'Aprobado', className: styles.paymentApproved },
      rejected: { label: 'Rechazado', className: styles.paymentRejected }
    }
    const badge = badges[status] || { label: status, className: '' }
    return <span className={`${styles.badge} ${badge.className}`}>{badge.label}</span>
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.headerTitle}>Panel de Administración</h1>
          <div className={styles.headerActions}>
            <Link href="/admin/settings" className={styles.settingsButton}>
              <Settings size={20} />
              Configuración
            </Link>
            <button onClick={handleLogout} className={styles.logoutButton}>
              <LogOut size={20} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className={styles.container}>
        {/* Stats Cards */}
        {isLoading && !stats ? (
          <div className={styles.loading}>Cargando estadísticas...</div>
        ) : stats && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <ShoppingBag size={24} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Total Órdenes</p>
                <h3 className={styles.statValue}>{stats.total_orders}</h3>
                <p className={styles.statSubtext}>Hoy: {stats.today_orders}</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <DollarSign size={24} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Ingresos Totales</p>
                <h3 className={styles.statValue}>{formatPrice(stats.total_revenue)}</h3>
                <p className={styles.statSubtext}>Hoy: {formatPrice(stats.today_revenue)}</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                <Clock size={24} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Pendientes</p>
                <h3 className={styles.statValue}>{stats.pending_orders}</h3>
                <p className={styles.statSubtext}>Por procesar</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #a6e8e4 0%, #8dd4cf 100%)' }}>
                <Package size={24} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>En Proceso</p>
                <h3 className={styles.statValue}>{stats.processing_orders + stats.shipped_orders}</h3>
                <p className={styles.statSubtext}>Procesando + Enviados</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
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

        {/* Orders Table */}
        <div className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>Órdenes Recientes</h2>
            <p className={styles.tableSubtitle}>
              {orders.length} órdenes encontradas
            </p>
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
                        <span className={styles.orderNumber}>
                          {order.order_number}
                        </span>
                      </td>
                      <td>
                        <div className={styles.customerInfo}>
                          <p className={styles.customerName}>{order.customer_name}</p>
                          <p className={styles.customerEmail}>{order.customer_email}</p>
                        </div>
                      </td>
                      <td>
                        <span className={styles.orderTotal}>
                          {formatPrice(Number(order.total))}
                        </span>
                      </td>
                      <td>
                        <span className={styles.itemsCount}>
                          {order.items_count} {order.items_count === 1 ? 'item' : 'items'}
                        </span>
                      </td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td>{getPaymentBadge(order.payment_status)}</td>
                      <td>
                        <span className={styles.orderDate}>
                          {formatDate(order.created_at)}
                        </span>
                      </td>
                      <td>
                        {order.payment_status === 'approved' ? (
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className={styles.viewButton}
                          >
                            Ver Detalles
                          </Link>
                        ) : (
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className={`${styles.viewButton} ${styles.viewButtonDisabled}`}
                          >
                            Ver Detalles
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}