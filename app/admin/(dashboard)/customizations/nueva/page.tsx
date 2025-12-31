"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import styles from './page.module.css'

const CUSTOMIZATION_TYPES = [
  { value: 'color', label: 'Color' },
  { value: 'size', label: 'Talla' },
  { value: 'material', label: 'Material' },
  { value: 'text', label: 'Texto' },
  { value: 'select', label: 'Selección' }
]

export default function NuevaPersonalizacionPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    type: 'color',
    description: '',
    is_required: false,
    display_order: 0,
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.display_name || !formData.type) {
      alert('Nombre, nombre de visualización y tipo son requeridos')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/customizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear opción')
      }

      const option = await response.json()
      alert('Opción creada exitosamente. Ahora puedes agregar valores.')
      router.push(`/admin/personalizaciones/${option.id}`)
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Error al crear opción')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
<Link href="/admin/customizations" className={styles.backButton}>
          <ArrowLeft size={20} />
          Volver a Personalizaciones
        </Link>
        <h1 className={styles.title}>Nueva Opción de Personalización</h1>
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
                <span className={styles.hint}>
                  Nombre interno para identificar la opción
                </span>
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
                <span className={styles.hint}>
                  Nombre que verán los clientes
                </span>
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
                <span className={styles.hint}>
                  Define cómo se mostrará la opción
                </span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Descripción (Opcional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={styles.textarea}
                  placeholder="Descripción de la opción de personalización..."
                  rows={4}
                />
              </div>
            </div>
          </div>

          <div className={styles.formColumn}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Configuración</h2>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Orden de Visualización
                </label>
                <input
                  type="number"
                  name="display_order"
                  value={formData.display_order}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="0"
                  min="0"
                />
                <span className={styles.hint}>
                  Orden en que aparecerá (menor número = primero)
                </span>
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
                <span className={styles.hint}>
                  Al asignar esta opción a un producto, será requerida automáticamente
                </span>
              </div>
            </div>

            <div className={styles.infoBox}>
              <h3 className={styles.infoTitle}>📝 Nota sobre valores</h3>
              <p className={styles.infoText}>
                Después de crear la opción, podrás agregar valores específicos 
                como "Rojo", "Azul" para colores o "S", "M", "L" para tallas.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Link href="/admin/personalizaciones" className={styles.cancelButton}>
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
                Crear Opción
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}