"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react'
import styles from './page.module.css'

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  base_price: number
  original_price: number | null
  image_url: string | null
  stock: number
  sku: string | null
  is_active: boolean
  is_featured: boolean
}

export default function EditarProductoPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.productId as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    base_price: '',
    original_price: '',
    image_url: '',
    stock: '0',
    sku: '',
    is_active: true,
    is_featured: false,
  })

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`)
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login')
          return
        }
        throw new Error('Error al cargar producto')
      }

      const data = await response.json()
      setProduct(data)
      
      // Llenar formulario
      setFormData({
        name: data.name || '',
        slug: data.slug || '',
        description: data.description || '',
        short_description: data.short_description || '',
        base_price: data.base_price?.toString() || '',
        original_price: data.original_price?.toString() || '',
        image_url: data.image_url || '',
        stock: data.stock?.toString() || '0',
        sku: data.sku || '',
        is_active: data.is_active ?? true,
        is_featured: data.is_featured ?? false,
      })
    } catch (error) {
      console.error('Error:', error)
      alert('Error al cargar producto')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.base_price) {
      alert('El nombre y el precio son requeridos')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug || undefined,
          description: formData.description || null,
          short_description: formData.short_description || null,
          base_price: parseFloat(formData.base_price),
          original_price: formData.original_price ? parseFloat(formData.original_price) : null,
          image_url: formData.image_url || null,
          stock: parseInt(formData.stock) || 0,
          sku: formData.sku || null,
          is_active: formData.is_active,
          is_featured: formData.is_featured,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar producto')
      }

      alert('Producto actualizado exitosamente')
      fetchProduct() // Recargar datos
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Error al actualizar producto')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error al eliminar producto')

      alert('Producto eliminado exitosamente')
      router.push('/admin/productos')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar producto')
    }
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Producto no encontrado</h2>
          <Link href="/admin/productos" className={styles.backButton}>
            Volver a Productos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <Link href="/admin/productos" className={styles.backButton}>
          <ArrowLeft size={20} />
          Volver a Productos
        </Link>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>Editar Producto</h1>
          <button onClick={handleDelete} className={styles.deleteButton}>
            <Trash2 size={20} />
            Eliminar Producto
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          {/* Columna Izquierda */}
          <div className={styles.formColumn}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Información Básica</h2>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Nombre del Producto <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Ej: Aretes Estrella de Mar"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Slug (URL amigable)
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="aretes-estrella-de-mar"
                />
                <span className={styles.hint}>
                  Ejemplo: aretes-estrella-de-mar
                </span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Descripción Corta
                </label>
                <input
                  type="text"
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Descripción breve del producto"
                  maxLength={300}
                />
                <span className={styles.hint}>
                  Máximo 300 caracteres
                </span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Descripción Completa
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={styles.textarea}
                  placeholder="Descripción detallada del producto..."
                  rows={6}
                />
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Imagen</h2>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  URL de la Imagen
                </label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                {formData.image_url && (
                  <div className={styles.imagePreview}>
                    <img src={formData.image_url} alt="Preview" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Columna Derecha */}
          <div className={styles.formColumn}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Precios e Inventario</h2>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Precio Base <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputGroup}>
                  <span className={styles.inputPrefix}>$</span>
                  <input
                    type="number"
                    name="base_price"
                    value={formData.base_price}
                    onChange={handleChange}
                    className={styles.inputWithPrefix}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Precio Original (Opcional)
                </label>
                <div className={styles.inputGroup}>
                  <span className={styles.inputPrefix}>$</span>
                  <input
                    type="number"
                    name="original_price"
                    value={formData.original_price}
                    onChange={handleChange}
                    className={styles.inputWithPrefix}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                <span className={styles.hint}>
                  Para mostrar descuento
                </span>
              </div>


              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Stock
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Estado</h2>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className={styles.checkbox}
                  />
                  Producto activo (visible en la tienda)
                </label>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleChange}
                    className={styles.checkbox}
                  />
                  Producto destacado
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <Link href="/admin/productos" className={styles.cancelButton}>
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className={styles.spinner} />
                Guardando...
              </>
            ) : (
              <>
                <Save size={20} />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}