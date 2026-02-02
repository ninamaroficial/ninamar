"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Send, Users, Loader2, Eye, X } from 'lucide-react'
import NewsletterEditor from '@/components/admin/NewsletterEditor'
import RecipientSelector from '@/components/admin/RecipientSelector'
import { render } from '@react-email/render'
import NewsletterTemplate from '@/emails/templates/NewsletterTemplate'
import styles from './page.module.css'

interface Subscriber {
  id: string
  email: string
  name: string | null
  is_active: boolean
  created_at: string
}

export default function NewsletterPage() {
  const router = useRouter()
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')

  const [formData, setFormData] = useState({
    subject: '',
    preheader: '',
    content: '<p style="color: #666; font-size: 16px; line-height: 1.6; margin: 10px 0;">✨ Comienza a escribir tu newsletter aquí...</p><p style="color: #666; font-size: 16px; line-height: 1.6; margin: 10px 0;">Usa los botones de la barra de herramientas para agregar <strong>formato</strong>, <em>imágenes</em>, enlaces y más! 💫</p>',
    ctaText: 'Ver Productos',
    ctaUrl: 'https://niñamar.com/productos',
    recipientType: 'active' as 'all' | 'active' | 'selected',
    selectedRecipients: [] as string[],
  })

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
  })

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const fetchSubscribers = async () => {
    setIsLoadingSubscribers(true)
    try {
      const response = await fetch('/api/admin/newsletter/subscribers')
      if (response.ok) {
        const data = await response.json()
        setSubscribers(data)
        setStats({
          total: data.length,
          active: data.filter((s: Subscriber) => s.is_active).length,
        })
      }
    } catch (error) {
      console.error('Error loading subscribers:', error)
      alert('Error al cargar suscriptores')
    } finally {
      setIsLoadingSubscribers(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleContentChange = (newContent: string) => {
    setFormData(prev => ({ ...prev, content: newContent }))
  }

  const handleRecipientSelect = (type: 'all' | 'active' | 'selected', selectedIds?: string[]) => {
    setFormData(prev => ({
      ...prev,
      recipientType: type,
      selectedRecipients: selectedIds || [],
    }))
  }

  const handlePreview = async () => {
    try {
      const html = await render(NewsletterTemplate({
        subject: formData.subject || 'Vista Previa',
        preheader: formData.preheader,
        content: formData.content,
        ctaText: formData.ctaText,
        ctaUrl: formData.ctaUrl,
        unsubscribeUrl: 'https://niñamar.com/newsletter/unsubscribe',
      }))
      setPreviewHtml(html)
      setShowPreview(true)
    } catch (error) {
      console.error('Error generating preview:', error)
      alert('Error al generar vista previa')
    }
  }

  const getRecipientCount = () => {
    if (formData.recipientType === 'all') return stats.total
    if (formData.recipientType === 'active') return stats.active
    return formData.selectedRecipients.length
  }

  const handleSendNewsletter = async () => {
    if (!formData.subject.trim() || !formData.content.trim()) {
      alert('El asunto y el contenido son requeridos')
      return
    }

    const recipientCount = getRecipientCount()
    if (recipientCount === 0) {
      alert('Debes seleccionar al menos un destinatario')
      return
    }

    if (!confirm(`¿Enviar newsletter a ${recipientCount} suscriptor(es)?`)) {
      return
    }

    setIsSending(true)

    try {
      const response = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al enviar newsletter')
      }

      const result = await response.json()
      alert(`Newsletter enviado exitosamente a ${result.sent} suscriptores`)

      // Limpiar formulario
      setFormData({
        subject: '',
        preheader: '',
        content: '<p style="color: #666; font-size: 16px; line-height: 1.6; margin: 10px 0;">✨ Comienza a escribir tu newsletter aquí...</p><p style="color: #666; font-size: 16px; line-height: 1.6; margin: 10px 0;">Usa los botones de la barra de herramientas para agregar <strong>formato</strong>, <em>imágenes</em>, enlaces y más! 💫</p>',
        ctaText: 'Ver Productos',
        ctaUrl: 'https://niñamar.com/productos',
        recipientType: 'active',
        selectedRecipients: [],
      })
    } catch (error: any) {
      console.error('Error sending newsletter:', error)
      alert(error.message || 'Error al enviar newsletter')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Newsletter</h1>
          <p className={styles.subtitle}>
            Crea y envía correos personalizados a tus suscriptores
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users size={24} />
          </div>
          <div className={styles.statInfo}>
            <p className={styles.statLabel}>Total Suscriptores</p>
            <p className={styles.statValue}>{stats.total}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconActive}>
            <Mail size={24} />
          </div>
          <div className={styles.statInfo}>
            <p className={styles.statLabel}>Suscriptores Activos</p>
            <p className={styles.statValue}>{stats.active}</p>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* Editor Section */}
        <div className={styles.editorSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Crear Newsletter</h2>
          </div>

          <div className={styles.form}>
            {/* Asunto */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Asunto <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="El asunto de tu newsletter"
                required
              />
            </div>

            {/* Preheader */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Texto de Vista Previa (Preheader)
              </label>
              <input
                type="text"
                name="preheader"
                value={formData.preheader}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Texto que aparece junto al asunto en el email"
              />
              <span className={styles.hint}>
                Opcional: Este texto aparece en la vista previa del email
              </span>
            </div>

            {/* Editor Visual */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Contenido <span className={styles.required}>*</span>
              </label>
              <NewsletterEditor
                value={formData.content}
                onChange={handleContentChange}
                onPreview={handlePreview}
              />
            </div>

            {/* CTA */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Texto del Botón
                </label>
                <input
                  type="text"
                  name="ctaText"
                  value={formData.ctaText}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Ver Productos"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  URL del Botón
                </label>
                <input
                  type="url"
                  name="ctaUrl"
                  value={formData.ctaUrl}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="https://niñamar.com/productos"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recipients Section */}
        <div className={styles.recipientsSection}>
          <RecipientSelector
            subscribers={subscribers}
            onSelect={handleRecipientSelect}
            selectedType={formData.recipientType}
            selectedIds={formData.selectedRecipients}
          />

          {/* Send Button */}
          <button
            onClick={handleSendNewsletter}
            disabled={isSending || getRecipientCount() === 0}
            className={styles.sendButton}
          >
            {isSending ? (
              <>
                <Loader2 size={20} className={styles.spinner} />
                Enviando...
              </>
            ) : (
              <>
                <Send size={20} />
                Enviar Newsletter
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className={styles.modal} onClick={() => setShowPreview(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Vista Previa del Email</h3>
              <button onClick={() => setShowPreview(false)} className={styles.closeButton}>
                <X size={24} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <iframe
                srcDoc={previewHtml}
                className={styles.previewFrame}
                title="Email Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
