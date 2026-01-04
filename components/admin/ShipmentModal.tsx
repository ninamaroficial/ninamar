"use client"

import { useState } from 'react'
import { X } from 'lucide-react'
import { SHIPPING_CARRIERS } from '@/types/database.types'
import styles from './ShipmentModal.module.css'

interface ShipmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (shipmentData: {
    carrier: string
    tracking_number: string
    shipping_date: string
    estimated_delivery_date?: string
    notes?: string
  }) => void
  orderNumber: string
}

export default function ShipmentModal({
  isOpen,
  onClose,
  onSubmit,
  orderNumber
}: ShipmentModalProps) {
  const [formData, setFormData] = useState({
    carrier: '',
    tracking_number: '',
    shipping_date: new Date().toISOString().split('T')[0],
    estimated_delivery_date: '',
    notes: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // ✅ AGREGAR: Early return
  if (!isOpen) return null

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpiar error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.carrier) {
      newErrors.carrier = 'Selecciona un proveedor'
    }

    if (!formData.tracking_number.trim()) {
      newErrors.tracking_number = 'El número de guía es requerido'
    }

    if (!formData.shipping_date) {
      newErrors.shipping_date = 'La fecha de envío es requerida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    onSubmit({
      carrier: formData.carrier,
      tracking_number: formData.tracking_number,
      shipping_date: formData.shipping_date,
      estimated_delivery_date: formData.estimated_delivery_date || undefined,
      notes: formData.notes || undefined
    })
  }

  // ✅ AGREGAR: return del JSX
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Información de Envío</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <p className={styles.orderInfo}>
            Pedido: <strong>#{orderNumber}</strong>
          </p>

          {/* Proveedor */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Proveedor de Envío *
            </label>
            <select
              name="carrier"
              value={formData.carrier}
              onChange={handleChange}
              className={`${styles.select} ${errors.carrier ? styles.inputError : ''}`}
            >
              <option value="">Selecciona un proveedor</option>
              {SHIPPING_CARRIERS.map(carrier => (
                <option key={carrier} value={carrier}>
                  {carrier}
                </option>
              ))}
            </select>
            {errors.carrier && (
              <span className={styles.error}>{errors.carrier}</span>
            )}
          </div>

          {/* Número de guía */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Número de Guía / Tracking *
            </label>
            <input
              type="text"
              name="tracking_number"
              value={formData.tracking_number}
              onChange={handleChange}
              placeholder="Ej: 123456789"
              className={`${styles.input} ${errors.tracking_number ? styles.inputError : ''}`}
            />
            {errors.tracking_number && (
              <span className={styles.error}>{errors.tracking_number}</span>
            )}
          </div>

          {/* Fecha de envío */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Fecha de Envío *
            </label>
            <input
              type="date"
              name="shipping_date"
              value={formData.shipping_date}
              onChange={handleChange}
              className={`${styles.input} ${errors.shipping_date ? styles.inputError : ''}`}
            />
            {errors.shipping_date && (
              <span className={styles.error}>{errors.shipping_date}</span>
            )}
          </div>

          {/* Fecha estimada de entrega */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Fecha Estimada de Entrega (opcional)
            </label>
            <input
              type="date"
              name="estimated_delivery_date"
              value={formData.estimated_delivery_date}
              onChange={handleChange}
              min={formData.shipping_date}
              className={styles.input}
            />
          </div>

          {/* Notas */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Notas (opcional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Información adicional sobre el envío..."
              rows={3}
              className={styles.textarea}
            />
          </div>

          {/* Botones */}
          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.submitButton}
            >
              Marcar como Enviado
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}