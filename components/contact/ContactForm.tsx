"use client"

import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import styles from './ContactForm.module.css'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'El mensaje es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setStatus('idle')

    try {
      const response = await fetch('/api/contact/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Error al enviar el mensaje')
      }

      setStatus('success')
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      })
    } catch (error) {
      console.error('Error:', error)
      setStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>
            Nombre completo *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
            placeholder="Tu nombre"
          />
          {errors.name && (
            <span className={styles.error}>{errors.name}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            placeholder="tu@email.com"
          />
          {errors.email && (
            <span className={styles.error}>{errors.email}</span>
          )}
        </div>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="phone" className={styles.label}>
            Teléfono (opcional)
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={styles.input}
            placeholder="300 123 4567"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="subject" className={styles.label}>
            Asunto
          </label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={styles.input}
          >
            <option value="">Selecciona un asunto</option>
            <option value="Pedido personalizado">Pedido personalizado</option>
            <option value="Consulta general">Consulta general</option>
            <option value="Estado de pedido">Estado de pedido</option>
            <option value="Reclamo">Reclamo</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="message" className={styles.label}>
          Mensaje *
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          className={`${styles.textarea} ${errors.message ? styles.inputError : ''}`}
          placeholder="Cuéntanos cómo podemos ayudarte..."
          rows={6}
        />
        {errors.message && (
          <span className={styles.error}>{errors.message}</span>
        )}
      </div>

      {status === 'success' && (
        <div className={styles.successMessage}>
          ✅ ¡Mensaje enviado exitosamente! Te responderemos pronto.
        </div>
      )}

      {status === 'error' && (
        <div className={styles.errorMessage}>
          ❌ Hubo un error al enviar el mensaje. Por favor intenta de nuevo.
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className={styles.submitButton}
      >
        {isSubmitting ? (
          <>
            <Loader2 size={20} className={styles.spinner} />
            Enviando...
          </>
        ) : (
          <>
            <Send size={20} />
            Enviar Mensaje
          </>
        )}
      </button>
    </form>
  )
}