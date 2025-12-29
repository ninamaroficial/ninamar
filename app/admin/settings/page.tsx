"use client"

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Lock, Save } from 'lucide-react'
import styles from './page.module.css'

export default function AdminSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validaciones
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Todos los campos son requeridos')
      return
    }

    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al cambiar la contraseña')
        return
      }

      setSuccess('Contraseña actualizada correctamente')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/admin/dashboard" className={styles.backButton}>
            <ArrowLeft size={20} />
            Volver al Dashboard
          </Link>
          <h1 className={styles.title}>Configuración</h1>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Lock size={24} />
            <h2 className={styles.cardTitle}>Cambiar Contraseña</h2>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            {success && (
              <div className={styles.success}>
                {success}
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.label}>Contraseña Actual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={styles.input}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Nueva Contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={styles.input}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <p className={styles.hint}>Mínimo 8 caracteres</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Confirmar Nueva Contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.input}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitButton}
            >
              <Save size={20} />
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}