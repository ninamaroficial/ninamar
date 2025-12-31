"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit, Trash2, Eye, EyeOff, Package } from 'lucide-react'
import styles from './page.module.css'

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  base_price: number
  image_url: string | null
  category_id: string | null
  is_active: boolean
  stock: number
}

export default function ProductosAdminPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products')
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login')
          return
        }
        throw new Error('Error al cargar productos')
      }
      
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al cargar productos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${productName}"? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error al eliminar producto')

      alert('Producto eliminado exitosamente')
      fetchProducts()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar producto')
    }
  }

  const handleToggleActive = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      })

      if (!response.ok) throw new Error('Error al actualizar producto')

      fetchProducts()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar producto')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const filteredProducts = products.filter(product => {
    if (filter === 'active') return product.is_active
    if (filter === 'inactive') return !product.is_active
    return true
  })

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando productos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Productos</h1>
          <p className={styles.subtitle}>{products.length} producto(s) en total</p>
        </div>
        <Link href="/admin/productos/nuevo" className={styles.addButton}>
          <Plus size={20} />
          Nuevo Producto
        </Link>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <button
          className={`${styles.filterButton} ${filter === 'all' ? styles.filterActive : ''}`}
          onClick={() => setFilter('all')}
        >
          Todos ({products.length})
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'active' ? styles.filterActive : ''}`}
          onClick={() => setFilter('active')}
        >
          Activos ({products.filter(p => p.is_active).length})
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'inactive' ? styles.filterActive : ''}`}
          onClick={() => setFilter('inactive')}
        >
          Inactivos ({products.filter(p => !p.is_active).length})
        </button>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className={styles.empty}>
          <Package size={64} />
          <h3>No hay productos</h3>
          <p>Comienza creando tu primer producto</p>
          <Link href="/admin/productos/nuevo" className={styles.emptyButton}>
            <Plus size={20} />
            Crear Producto
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredProducts.map((product) => (
            <div key={product.id} className={styles.card}>
              {/* Image */}
              <div className={styles.imageContainer}>
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className={styles.image}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <Package size={48} />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className={`${styles.statusBadge} ${product.is_active ? styles.statusActive : styles.statusInactive}`}>
                  {product.is_active ? 'Activo' : 'Inactivo'}
                </div>
              </div>

              {/* Content */}
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{product.name}</h3>
                <p className={styles.price}>{formatPrice(product.base_price)}</p>
                
                {product.description && (
                  <p className={styles.description}>
                    {product.description.substring(0, 100)}
                    {product.description.length > 100 && '...'}
                  </p>
                )}

                <div className={styles.meta}>
                  <span className={styles.metaItem}>
                    Stock: {product.stock}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className={styles.cardActions}>
                <button
                  onClick={() => handleToggleActive(product.id, product.is_active)}
                  className={styles.actionButton}
                  title={product.is_active ? 'Desactivar' : 'Activar'}
                >
                  {product.is_active ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <Link
                  href={`/admin/productos/${product.id}`}
                  className={styles.actionButton}
                  title="Editar"
                >
                  <Edit size={18} />
                </Link>
                <button
                  onClick={() => handleDelete(product.id, product.name)}
                  className={`${styles.actionButton} ${styles.actionDelete}`}
                  title="Eliminar"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}