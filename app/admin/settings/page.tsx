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

interface WhatsAppProfile {
  about: string
  description: string
  email: string
  websites: string
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
  const [botMessage, setBotMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [whatsappProfile, setWhatsappProfile] = useState<WhatsAppProfile>({
    about: 'Niñamar',
    description: 'Accesorios personalizados hechos a mano con amor 💜',
    email: 'contacto@ninamar.com',
    websites: 'https://ninamar.com'
  })
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)

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
    setBotMessage(null)
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
      setTimeout(() => setBotMessage(null), 3000)
    }
  }

  const loadWhatsAppProfile = async () => {
    setIsLoadingProfile(true)
    try {
      const response = await fetch('/api/admin/whatsapp/profile')
      if (response.ok) {
        const data = await response.json()
        if (data.profile) {
          setWhatsappProfile({
            about: data.profile.about || '',
            description: data.profile.description || '',
            email: data.profile.email || '',
            websites: data.profile.websites?.[0] || ''
          })
        }
      }
    } catch (err) {
      console.error('Error cargando perfil de WhatsApp:', err)
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const saveWhatsAppProfile = async () => {
    setIsSavingProfile(true)
    setProfileMessage(null)
    try {
      const response = await fetch('/api/admin/whatsapp/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(whatsappProfile)
      })

      if (response.ok) {
        const data = await response.json()
        setProfileMessage({ 
          type: 'success', 
          text: '✅ ' + (data.message || 'Perfil actualizado correctamente')
        })
      } else {
        const data = await response.json()
        setProfileMessage({ type: 'error', text: `❌ Error: ${data.error || 'Error al actualizar perfil'}` })
      }
    } catch (err) {
      setProfileMessage({ type: 'error', text: '❌ Error al actualizar perfil de WhatsApp' })
    } finally {
      setIsSavingProfile(false)
      setTimeout(() => setProfileMessage(null), 5000)
    }
  }

  const handleProfileChange = (field: keyof WhatsAppProfile, value: string) => {
    setWhatsappProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  useEffect(() => {
    loadWhatsAppProfile()
  }, [])

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
              <h2>Perfil de WhatsApp Business</h2>
            </div>

            <div className={styles.form}>
              {profileMessage && (
                <div className={`${styles.alert} ${profileMessage.type === 'success' ? styles.success : styles.error}`}>
                  {profileMessage.text}
                </div>
              )}

              {isLoadingProfile && (
                <div className={styles.loading}>Cargando perfil actual...</div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.label}>Nombre del Negocio (About)</label>
                <input
                  type="text"
                  value={whatsappProfile.about}
                  onChange={(e) => handleProfileChange('about', e.target.value)}
                  className={styles.input}
                  placeholder="Niñamar"
                  maxLength={139}
                />
                <p className={styles.hint}>Este es el nombre que aparecerá en WhatsApp (máx. 139 caracteres)</p>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Descripción del Negocio</label>
                <textarea
                  value={whatsappProfile.description}
                  onChange={(e) => handleProfileChange('description', e.target.value)}
                  className={styles.textarea}
                  placeholder="Accesorios personalizados hechos a mano con amor 💜"
                  rows={3}
                  maxLength={512}
                />
                <p className={styles.hint}>Descripción visible en el perfil (máx. 512 caracteres)</p>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email de Contacto</label>
                <input
                  type="email"
                  value={whatsappProfile.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  className={styles.input}
                  placeholder="contacto@ninamar.com"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Sitio Web</label>
                <input
                  type="url"
                  value={whatsappProfile.websites}
                  onChange={(e) => handleProfileChange('websites', e.target.value)}
                  className={styles.input}
                  placeholder="https://ninamar.com"
                />
              </div>

              <button
                onClick={saveWhatsAppProfile}
                disabled={isSavingProfile}
                className={styles.submitButton}
              >
                <Save size={20} />
                {isSavingProfile ? 'Guardando...' : 'Actualizar Perfil de WhatsApp'}
              </button>

              <div className={styles.alert} style={{ marginTop: '1rem', background: '#fff3cd', border: '1px solid #ffc107' }}>
                <strong>📸 Foto de Perfil:</strong> Para cambiar la foto de perfil de WhatsApp, ve a:<br/>
                <a href="https://business.facebook.com/wa/manage/phone-numbers/" target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc', textDecoration: 'underline' }}>
                  Facebook Business Manager → WhatsApp → Configuración del número
                </a>
              </div>

              <div className={styles.alert} style={{ marginTop: '1rem', background: '#eff6ff', border: '1px solid #3b82f6' }}>
                <strong>ℹ️ Nota importante:</strong> Los cambios en el perfil de WhatsApp pueden tardar hasta 24 horas en reflejarse completamente.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}