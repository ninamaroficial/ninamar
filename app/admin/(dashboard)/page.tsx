"use client"

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { BarChart3, DollarSign, MapPin, Package, Truck } from 'lucide-react'
import styles from './page.module.css'

interface Stats {
  total_orders: number
  pending_orders: number
  paid_orders: number
  processing_orders: number
  shipped_orders: number
  delivered_orders: number
  total_revenue: number
  net_revenue: number
  mercadopago_fees: number
  shipping_costs: number
  today_orders: number
  today_revenue: number
  today_net_revenue: number
}

interface AnalyticsPoint {
  label: string
  value: number
}

interface OrderAnalytics {
  monthly_revenue: AnalyticsPoint[]
  top_products: AnalyticsPoint[]
  top_product_types: AnalyticsPoint[]
  top_states: AnalyticsPoint[]
  top_cities: AnalyticsPoint[]
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [analytics, setAnalytics] = useState<OrderAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/stats', { cache: 'no-store' }),
        fetch('/api/admin/orders/analytics', { cache: 'no-store' }),
      ])

      const statsData = await statsRes.json()
      const analyticsData = await analyticsRes.json()

      setStats(statsData)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const maxMonthlyRevenue = useMemo(() => {
    return Math.max(1, ...(analytics?.monthly_revenue?.map((p) => p.value) || [1]))
  }, [analytics])

  const renderRanking = (title: string, rows: AnalyticsPoint[], icon: React.ReactNode, suffix = '') => (
    <section className={styles.rankCard}>
      <div className={styles.rankHeader}>
        <span className={styles.rankIcon}>{icon}</span>
        <h3>{title}</h3>
      </div>

      {rows.length === 0 ? (
        <p className={styles.emptyText}>Sin datos todavía.</p>
      ) : (
        <div className={styles.rankList}>
          {rows.map((row, index) => {
            const max = Math.max(rows[0]?.value || 1, 1)
            const width = Math.max(6, Math.round((row.value / max) * 100))

            return (
              <div className={styles.rankRow} key={`${title}-${row.label}-${index}`}>
                <div className={styles.rankLabelRow}>
                  <span className={styles.rankLabel}>{row.label}</span>
                  <span className={styles.rankValue}>
                    {row.value.toLocaleString('es-CO')}
                    {suffix}
                  </span>
                </div>
                <div className={styles.rankTrack}>
                  <div className={styles.rankFill} style={{ width: `${width}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.heading}>
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>Analítica de pedidos, ingresos y destinos de envío.</p>
          </div>
        </div>

        {isLoading && !stats ? (
          <div className={styles.loading}>Cargando estadísticas...</div>
        ) : stats ? (
          <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #1f6f63 0%, #15574e 100%)' }}>
                <Package size={24} />
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
                <p className={styles.statLabel}>Ingresos Netos</p>
                <h3 className={styles.statValue}>{formatPrice(stats.net_revenue)}</h3>
                <p className={styles.statSubtext}>
                  Hoy: {formatPrice(stats.today_net_revenue)}
                  <br />
                  <span style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px', display: 'block' }}>
                    Después de gastos MP + envíos
                  </span>
                </p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                <BarChart3 size={24} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Desglose de Ingresos</p>
                <div style={{ fontSize: '0.85rem', lineHeight: '1.6', marginTop: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Brutos (total facturado):</span>
                    <span style={{ fontWeight: 500 }}>{formatPrice(stats.total_revenue)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d97706', marginBottom: '4px' }}>
                    <span>- MP (3.29% + IVA + $952):</span>
                    <span style={{ fontWeight: 500 }}>-{formatPrice(stats.mercadopago_fees)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d97706', marginBottom: '4px' }}>
                    <span>- Envíos:</span>
                    <span style={{ fontWeight: 500 }}>-{formatPrice(stats.shipping_costs)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', paddingTop: '4px', borderTop: '1px solid #e5e7eb' }}>
                    <span>= Neto:</span>
                    <span style={{ fontWeight: 600 }}>{formatPrice(stats.net_revenue)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)' }}>
                <Truck size={24} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>En Proceso</p>
                <h3 className={styles.statValue}>{stats.processing_orders + stats.shipped_orders}</h3>
                <p className={styles.statSubtext}>Procesando + Enviados</p>
              </div>
            </div>
          </div>
          <div className={styles.analyticsSection}>
            <section className={styles.chartCard}>
              <div className={styles.rankHeader}>
                <span className={styles.rankIcon}><BarChart3 size={18} /></span>
                <h3>Ingresos por mes (desde enero)</h3>
              </div>

              {!analytics?.monthly_revenue?.length ? (
                <p className={styles.emptyText}>Sin datos todavía.</p>
              ) : (
                <div className={styles.monthChartWrap}>
                  <div className={styles.monthChartBackdrop} />
                  <div className={styles.monthChart}>
                  {analytics.monthly_revenue.map((point, idx) => {
                    const height = Math.max(8, Math.round((point.value / maxMonthlyRevenue) * 100))
                    return (
                      <div className={styles.monthColumn} key={`${point.label}-${idx}`}>
                        <span className={styles.monthColumnValue}>{formatPrice(point.value)}</span>
                        <div className={styles.monthBarTrackVertical}>
                          <div className={styles.monthBarFillVertical} style={{ height: `${height}%` }} />
                        </div>
                        <span className={styles.monthColumnLabel}>{point.label}</span>
                      </div>
                    )
                  })}
                  </div>
                </div>
              )}
            </section>

            <div className={styles.rankGrid}>
              {renderRanking('Artículos más pedidos (slug)', analytics?.top_products || [], <Package size={18} />, ' uds')}
              {renderRanking('Tipos de artículos más pedidos', analytics?.top_product_types || [], <Package size={18} />, ' uds')}
              {renderRanking('Departamentos con más envíos', analytics?.top_states || [], <MapPin size={18} />, ' envíos')}
              {renderRanking('Ciudades con más envíos', analytics?.top_cities || [], <MapPin size={18} />, ' envíos')}
            </div>
          </div>
          </>
        ) : (
          <div className={styles.loading}>No se pudo cargar la información.</div>
        )}
      </div>
    </div>
  )
}