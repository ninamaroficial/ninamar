"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Trash2, Plus, Edit2 } from 'lucide-react'
import styles from './page.module.css'

interface CustomizationOption {
  id: string
  name: string
  display_name: string
  type: string
  description: string | null
  is_required: boolean
  display_order: number
}

interface CustomizationValue {
  id: string
  option_id: string
  value: string
  display_name: string
  additional_price: number
  hex_color: string | null
  image_url: string | null
  is_available: boolean
  display_order: number
}

const CUSTOMIZATION_TYPES = [
  { value: 'color', label: 'Color' },
  { value: 'size', label: 'Talla' },
  { value: 'material', label: 'Material' },
  { value: 'text', label: 'Texto' },
  { value: 'select', label: 'Selección' }
]

export default function EditarPersonalizacionPage() {
  const router = useRouter()
  const params = useParams()
  const optionId = params.optionId as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [option, setOption] = useState<CustomizationOption | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    type: 'color',
    description: '',
    is_required: false,
    display_order: 0,
  })

  // Estados para valores
  const [values, setValues] = useState<CustomizationValue[]>([])
  const [isLoadingValues, setIsLoadingValues] = useState(true)
  const [isAddingValue, setIsAddingValue] = useState(false)
  const [newValue, setNewValue] = useState({
    value: '',
    display_name: '',
    additional_price: '',
    hex_color: '',
    image_url: '',
    is_available: true,
    display_order: 0,
  })

  useEffect(() => {
    if (optionId) {
      fetchOption()
      fetchValues()
    }
  }, [optionId])

  const fetchOption = async () => {
    try {
      const response = await fetch(`/api/admin/customizations/${optionId}`)
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login')
          return
        }
        throw new Error('Error al cargar opción')
      }

      const data = await response.json()
      setOption(data)
      setFormData({
        name: data.name || '',
        display_name: data.display_name || '',
        type: data.type || 'color',
        description: data.description || '',
        is_required: data.is_required ?? false,
        display_order: data.display_order ?? 0,
      })
    } catch (error) {
      console.error('Error:', error)
      alert('Error al cargar opción')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchValues = async () => {
    setIsLoadingValues(true)
    try {
      const response = await fetch(`/api/admin/customizations/${optionId}/values`)
      if (response.ok) {
        const data = await response.json()
        setValues(data)
      }
    } catch (error) {
      console.error('Error loading values:', error)
    } finally {
      setIsLoadingValues(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else if (name === 'display_order') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleValueChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setNewValue(prev => ({ ...prev, [name]: checked }))
    } else if (name === 'display_order' || name === 'additional_price') {
      setNewValue(prev => ({ ...prev, [name]: value }))
    } else {
      setNewValue(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.display_name || !formData.type) {
      alert('Nombre, nombre de visualización y tipo son requeridos')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/customizations/${optionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar opción')
      }

      alert('Opción actualizada exitosamente')
      fetchOption()
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Error al actualizar opción')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddValue = async () => {
    if (!newValue.value || !newValue.display_name) {
      alert('Valor y nombre de visualización son requeridos')
      return
    }

    setIsAddingValue(true)
    try {
      const response = await fetch(`/api/admin/customizations/${optionId}/values`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: newValue.value,
          display_name: newValue.display_name,
          additional_price: parseFloat(newValue.additional_price) || 0,
          hex_color: newValue.hex_color || null,
          image_url: newValue.image_url || null,
          is_available: newValue.is_available,
          display_order: parseInt(newValue.display_order.toString()) || 0,
        }),
      })

      if (!response.ok) throw new Error('Error al agregar valor')

      setNewValue({
        value: '',
        display_name: '',
        additional_price: '',
        hex_color: '',
        image_url: '',
        is_available: true,
        display_order: 0,
      })
      await fetchValues()
      alert('Valor agregado exitosamente')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al agregar valor')
    } finally {
      setIsAddingValue(false)
    }
  }

  const handleDeleteValue = async (valueId: string, valueName: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${valueName}"?`)) return

    try {
      const response = await fetch(`/api/admin/customizations/${optionId}/values/${valueId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error al eliminar valor')

      await fetchValues()
      alert('Valor eliminado')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar valor')
    }
  }

  const handleToggleAvailable = async (valueId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/customizations/${optionId}/values/${valueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: !currentStatus }),
      })

      if (!response.ok) throw new Error('Error al actualizar valor')

      await fetchValues()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar valor')
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar esta opción? Esto también eliminará todos sus valores.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/customizations/${optionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error al eliminar opción')

      alert('Opción eliminada exitosamente')
      router.push('/admin/personalizaciones')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar opción')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando opción...</p>
        </div>
      </div>
    )
  }

  if (!option) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Opción no encontrada</h2>
          <Link href="/admin/personalizaciones" className={styles.backButton}>
            Volver a Personalizaciones
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/admin/personalizaciones" className={styles.backButton}>
          <ArrowLeft size={20} />
          Volver a Personalizaciones
        </Link>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>Editar Opción: {option.display_name}</h1>
          <button onClick={handleDelete} className={styles.deleteButton}>
            <Trash2 size={20} />
            Eliminar Opción
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formColumn}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Información Básica</h2>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Nombre Técnico <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Ej: color, talla, material"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Nombre de Visualización <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Ej: Color, Talla, Material"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Tipo de Personalización <span className={styles.required}>*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={styles.input}
                  required
                >
                  {CUSTOMIZATION_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Descripción (Opcional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={styles.textarea}
                  placeholder="Descripción de la opción..."
                  rows={4}
                />
              </div>
            </div>
          </div>

          <div className={styles.formColumn}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Configuración</h2>

              <div className={styles.formGroup}>
                <label className={styles.label}>Orden de Visualización</label>
                <input
                  type="number"
                  name="display_order"
                  value={formData.display_order}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="is_required"
                    checked={formData.is_required}
                    onChange={handleChange}
                    className={styles.checkbox}
                  />
                  Requerido por defecto
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Link href="/admin/personalizaciones" className={styles.cancelButton}>
            Cancelar
          </Link>
          <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
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

      {/* Sección de Valores */}
      <div className={styles.valuesSection}>
        <h2 className={styles.valuesSectionTitle}>Valores de Personalización</h2>

        {/* Agregar nuevo valor */}
        <div className={styles.addValueForm}>
          <div className={styles.valueFormGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Valor Técnico *</label>
              <input
                type="text"
                name="value"
                value={newValue.value}
                onChange={handleValueChange}
                className={styles.input}
                placeholder="Ej: red, S, cotton"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Nombre de Visualización *</label>
              <input
                type="text"
                name="display_name"
                value={newValue.display_name}
                onChange={handleValueChange}
                className={styles.input}
                placeholder="Ej: Rojo, Small, Algodón"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Precio Adicional</label>
              <div className={styles.inputGroup}>
                <span className={styles.inputPrefix}>$</span>
                <input
                  type="number"
                  name="additional_price"
                  value={newValue.additional_price}
                  onChange={handleValueChange}
                  className={styles.inputWithPrefix}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {formData.type === 'color' && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Color Hex</label>
                <input
                  type="text"
                  name="hex_color"
                  value={newValue.hex_color}
                  onChange={handleValueChange}
                  className={styles.input}
                  placeholder="#FF0000"
                />
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.label}>URL Imagen (Opcional)</label>
              <input
                type="url"
                name="image_url"
                value={newValue.image_url}
                onChange={handleValueChange}
                className={styles.input}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Orden</label>
              <input
                type="number"
                name="display_order"
                value={newValue.display_order}
                onChange={handleValueChange}
                className={styles.input}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddValue}
            disabled={isAddingValue || !newValue.value || !newValue.display_name}
            className={styles.addValueButton}
          >
            {isAddingValue ? (
              <>
                <Loader2 size={18} className={styles.spinner} />
                Agregando...
              </>
            ) : (
              <>
                <Plus size={18} />
                Agregar Valor
              </>
            )}
          </button>
        </div>

        {/* Lista de valores */}
        <div className={styles.valuesList}>
          {isLoadingValues ? (
            <div className={styles.loadingValues}>
              <div className={styles.spinner}></div>
              <p>Cargando valores...</p>
            </div>
          ) : values.length === 0 ? (
            <div className={styles.noValues}>
              <p>No hay valores. Agrega el primero arriba.</p>
            </div>
          ) : (
            values.map((value) => (
              <div key={value.id} className={styles.valueCard}>
                <div className={styles.valueCardContent}>
                  {value.hex_color && (
                    <div
                      className={styles.colorPreview}
                      style={{ backgroundColor: value.hex_color }}
                    />
                  )}
                  <div className={styles.valueInfo}>
                    <h4 className={styles.valueName}>{value.display_name}</h4>
                    <p className={styles.valueTechnical}>{value.value}</p>
                  </div>
                  {value.additional_price > 0 && (
                    <div className={styles.valuePrice}>
                      +{formatPrice(value.additional_price)}
                    </div>
                  )}
                  <div className={styles.valueMeta}>
                    <span className={`${styles.statusBadge} ${value.is_available ? styles.statusActive : styles.statusInactive}`}>
                      {value.is_available ? 'Disponible' : 'No disponible'}
                    </span>
                    <span className={styles.orderBadge}>
                      Orden: {value.display_order}
                    </span>
                  </div>
                </div>

                <div className={styles.valueActions}>
                  <button
                    type="button"
                    onClick={() => handleToggleAvailable(value.id, value.is_available)}
                    className={styles.toggleButton}
                    title={value.is_available ? 'Desactivar' : 'Activar'}
                  >
                    {value.is_available ? '👁️' : '🚫'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteValue(value.id, value.display_name)}
                    className={styles.deleteValueButton}
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}