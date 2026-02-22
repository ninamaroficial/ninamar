"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Lock, Save, Settings as SettingsIcon, MessageCircle } from 'lucide-react'
import styles from './page.module.css'

interface BotSettings {
  name: string
  description: string
  welcomeMessage: string
  errorMessage: string
  closingMessage: string
}

export default function AdminSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [botSettings, setBotSettings] = useState<BotSettings>({
    name: '🤖 Niña Mar Bot',
    description: 'Tu asistente de compra virtual',
    welcomeMessage: 'Hola! Bienvenido a Niña Mar',
    errorMessage: 'Lo siento, ocurrió un error',
    closingMessage: 'Gracias por tu compra'
  })
  const [isSavingBot, setIsSavingBot] = useState(false)
  const [botMessage, setBotMessage] = useState('')

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

      if (response.ok) {
        setSuccess('Contraseña actualizada correctamente')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setError(data.message || 'Error al actualizar contraseña')
      }
    } catch (err) {
      setError('Error al actualizar contraseña')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBotSettingChange = (field: keyof BotSettings, value: string) => {
    setBotSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const saveBotSettings = async () => {
    setIsSavingBot(true)
    setBotMessage('')
    try {
      const response = await fetch('/api/admin/settings/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(botSettings)
      })

      if (response.ok) {
        setBotMessage({ type: 'success', text: '✅ Configuración del bot guardada' })
      } else {
        setBotMessage({ type: 'error', text: '❌ Error al guardar configuración' })
      }
    } catch (err) {
      setBotMessage({ type: 'error', text: '❌ Error al guardar configuración' })
    } finally {
      setIsSavingBot(false)
      setTimeout(() => setBotMessage(''), 3000)
    }
  }

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
          <Link href="/admin" className={styles.backButton}>
            <ArrowLeft size={20} />
            Volver al Dashboard
          </Link>
          <h1 className={styles.title}>Configuración</h1>
        </div>
      </div>

      <div className={styles.container}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <Lock size={24} />
              <h2>Cambiar Contraseña</h2>
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

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <MessageCircle size={24} />
              <h2>Configuración del Chatbot WhatsApp</h2>
            </div>

            <div className={styles.form}>
              {botMessage && (
                <div className={`${styles.alert} ${botMessage.type === 'success' ? styles.success : styles.error}`}>
                  {botMessage.text}
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.label}>Nombre del Bot</label>
                <input
                  type="text"
                  value={botSettings.name}
                  onChange={(e) => handleBotSettingChange('name', e.target.value)}
                  className={styles.input}
                  placeholder="🤖 Niña Mar Bot"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Descripción</label>
                <input
                  type="text"
                  value={botSettings.description}
                  onChange={(e) => handleBotSettingChange('description', e.target.value)}
                  className={styles.input}
                  placeholder="Tu asistente de compra virtual"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Mensaje de Bienvenida</label>
                <textarea
                  value={botSettings.welcomeMessage}
                  onChange={(e) => handleBotSettingChange('welcomeMessage', e.target.value)}
                  className={styles.textarea}
                  placeholder="¡Hola! Bienvenido a Niña Mar"
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Mensaje de Error</label>
                <textarea
                  value={botSettings.errorMessage}
                  onChange={(e) => handleBotSettingChange('errorMessage', e.target.value)}
                  className={styles.textarea}
                  placeholder="Lo siento, ocurrió un error"
                  rows={2}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Mensaje de Cierre</label>
                <textarea
                  value={botSettings.closingMessage}
                  onChange={(e) => handleBotSettingChange('closingMessage', e.target.value)}
                  className={styles.textarea}
                  placeholder="Gracias por tu compra"
                  rows={2}
                />
              </div>

              <button
                onClick={saveBotSettings}
                disabled={isSavingBot}
                className={styles.submitButton}
              >
                <Save size={20} />
                {isSavingBot ? 'Guardando...' : 'Guardar Configuración del Bot'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}