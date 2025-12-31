"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit, Trash2, Package, List } from 'lucide-react'
import styles from './page.module.css'

interface CustomizationOption {
  id: string
  name: string
  display_name: string
  type: string
  description: string | null
  is_required: boolean
  display_order: number
  created_at: string
}

export default function CustomizationsPage() {  // ← CAMBIO AQUÍ
  const router = useRouter()
  const [options, setOptions] = useState<CustomizationOption[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOptions()
  }, [])

  const fetchOptions = async () => {
    try {
      const response = await fetch('/api/admin/customizations')
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login')
          return
        }
        throw new Error('Error al cargar opciones')
      }

      const data = await response.json()
      setOptions(data)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al cargar opciones de personalización')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (optionId: string, optionName: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${optionName}"? Esto también eliminará todos sus valores.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/customizations/${optionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error al eliminar opción')

      alert('Opción eliminada exitosamente')
      fetchOptions()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar opción')
    }
  }

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'color': 'Color',
      'size': 'Talla',
      'material': 'Material',
      'text': 'Texto',
      'select': 'Selección'
    }
    return types[type] || type
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando opciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Opciones de Personalización</h1>
          <p className={styles.subtitle}>{options.length} opción(es) disponibles</p>
        </div>
        <Link href="/admin/customizations/nueva" className={styles.addButton}>
          <Plus size={20} />
          Nueva Opción
        </Link>
      </div>

      {options.length === 0 ? (
        <div className={styles.empty}>
          <Package size={64} />
          <h3>No hay opciones de personalización</h3>
          <p>Crea opciones como colores, tallas o materiales para tus productos</p>
          <Link href="/admin/customizations/nueva" className={styles.emptyButton}>
            <Plus size={20} />
            Crear Opción
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {options.map((option) => (
            <div key={option.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <List size={24} />
                </div>
                <div className={styles.typeBadge}>
                  {getTypeLabel(option.type)}
                </div>
              </div>

              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{option.display_name}</h3>
                <p className={styles.cardSubtitle}>{option.name}</p>
                
                {option.description && (
                  <p className={styles.description}>{option.description}</p>
                )}

                <div className={styles.meta}>
                  {option.is_required && (
                    <span className={styles.requiredBadge}>Requerido por defecto</span>
                  )}
                  <span className={styles.metaItem}>Orden: {option.display_order}</span>
                </div>
              </div>

              <div className={styles.cardActions}>
                <Link
                  href={`/admin/customizations/${option.id}`}
                  className={styles.actionButton}
                  title="Editar y gestionar valores"
                >
                  <Edit size={18} />
                </Link>
                <button
                  onClick={() => handleDelete(option.id, option.display_name)}
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