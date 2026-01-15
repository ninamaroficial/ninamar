"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit, Trash2, Folder } from 'lucide-react'
import styles from './page.module.css'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  created_at: string
}

export default function CategoriasAdminPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login')
          return
        }
        throw new Error('Error al cargar categorías')
      }

      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al cargar categorías')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (categoryId: string, categoryName: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${categoryName}"? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al eliminar categoría')
      }

      alert('Categoría eliminada exitosamente')
      fetchCategories()
    } catch (error) {
      console.error('Error:', error)
      alert(error instanceof Error ? error.message : 'Error al eliminar categoría')
    }
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando categorías...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Categorías</h1>
          <p className={styles.subtitle}>{categories.length} categoría(s) en total</p>
        </div>
        <Link href="/admin/categorias/nueva" className={styles.addButton}>
          <Plus size={20} />
          Nueva Categoría
        </Link>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className={styles.empty}>
          <Folder size={64} />
          <h3>No hay categorías</h3>
          <p>Comienza creando tu primera categoría</p>
          <Link href="/admin/categorias/nueva" className={styles.emptyButton}>
            <Plus size={20} />
            Crear Categoría
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {categories.map((category) => (
            <div key={category.id} className={styles.card}>
              {/* Image */}
              <div className={styles.imageContainer}>
                {category.image_url ? (
                  <Image
                    src={category.image_url}
                    alt={category.name}
                    fill
                    className={styles.image}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <Folder size={48} />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{category.name}</h3>
                <p className={styles.slug}>/{category.slug}</p>

                {category.description && (
                  <p className={styles.description}>
                    {category.description.substring(0, 100)}
                    {category.description.length > 100 && '...'}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className={styles.cardActions}>
                <Link
                  href={`/admin/categorias/${category.id}`}
                  className={styles.actionButton}
                  title="Editar"
                >
                  <Edit size={18} />
                </Link>
                <button
                  onClick={() => handleDelete(category.id, category.name)}
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
