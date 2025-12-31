"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import styles from './page.module.css'

interface Category {
  id: string
  name: string
  slug: string
}

export default function NuevoProductoPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    base_price: '',
    original_price: '',
    category_id: '',
    stock: '0',
    is_active: true,
    is_featured: false,
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
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
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug || undefined,
          description: formData.description || null,
          short_description: formData.short_description || null,
          base_price: parseFloat(formData.base_price),
          original_price: formData.original_price ? parseFloat(formData.original_price) : null,
          category_id: formData.category_id || null,
          stock: parseInt(formData.stock) || 0,
          is_active: formData.is_active,
          is_featured: formData.is_featured,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear producto')
      }

      const product = await response.json()
      alert('Producto creado exitosamente. Ahora puedes agregar imágenes.')
      router.push(`/admin/productos/${product.id}`)
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Error al crear producto')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/admin/productos" className={styles.backButton}>
          <ArrowLeft size={20} />
          Volver a Productos
        </Link>
        <h1 className={styles.title}>Nuevo Producto</h1>
      </div>

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
                  placeholder="Se generará automáticamente si se deja vacío"
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

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Categoría
                </label>
                {isLoadingCategories ? (
                  <div className={styles.loadingSelect}>
                    Cargando categorías...
                  </div>
                ) : (
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className={styles.input}
                  >
                    <option value="">Sin categoría</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
                <span className={styles.hint}>
                  Opcional - Ayuda a organizar tus productos
                </span>
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

            <div className={styles.section}>
              <div className={styles.infoBox}>
                <h3 className={styles.infoTitle}>📸 Nota sobre imágenes</h3>
                <p className={styles.infoText}>
                  Después de crear el producto, serás redirigido a la página de edición 
                  donde podrás agregar múltiples imágenes a la galería.
                </p>
              </div>
            </div>
          </div>
        </div>

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
                Creando...
              </>
            ) : (
              <>
                <Save size={20} />
                Crear Producto
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}