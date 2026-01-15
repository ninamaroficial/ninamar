"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import styles from './page.module.css'

export default function NuevaCategoriaPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Auto-generar slug cuando se escribe el nombre
    if (name === 'name' && !formData.slug) {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.slug) {
      alert('El nombre y el slug son requeridos')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          image_url: formData.image_url || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear categoría')
      }

      alert('Categoría creada exitosamente')
      router.push('/admin/categorias')
    } catch (error) {
      console.error('Error:', error)
      alert(error instanceof Error ? error.message : 'Error al crear categoría')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <Link href="/admin/categorias" className={styles.backButton}>
          <ArrowLeft size={20} />
          Volver
        </Link>
        <h1 className={styles.title}>Nueva Categoría</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Información Básica</h2>

          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Nombre <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={styles.input}
              required
              placeholder="Ej: Broches para el cabello"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="slug" className={styles.label}>
              Slug (URL) <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className={styles.input}
              required
              placeholder="ej: broches-cabello"
              pattern="[a-z0-9-]+"
              title="Solo letras minúsculas, números y guiones"
            />
            <p className={styles.hint}>
              Se usará en la URL: /productos/{formData.slug || 'slug'}
            </p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={styles.textarea}
              rows={4}
              placeholder="Descripción de la categoría (opcional)"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="image_url" className={styles.label}>
              URL de Imagen
            </label>
            <input
              type="url"
              id="image_url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              className={styles.input}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            <p className={styles.hint}>
              URL de la imagen de la categoría (opcional)
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <Link href="/admin/categorias" className={styles.cancelButton}>
            Cancelar
          </Link>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className={styles.spinner} />
                Guardando...
              </>
            ) : (
              <>
                <Save size={20} />
                Crear Categoría
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
