"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Send, Users, Loader2, Eye } from 'lucide-react'
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

  const [formData, setFormData] = useState({
    template: 'custom',
    subject: '',
    preheader: '',
    content: '',
    images: [] as Array<{ url: string; alt: string; caption?: string }>,
    products: [] as Array<{ name: string; image: string; price: string; url: string }>,
    discount: '',
    couponCode: '',
    expiryDate: '',
    ctaText: 'Ver Productos',
    ctaUrl: 'https://niñamar.com/productos',
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSendNewsletter = async () => {
    if (!formData.subject.trim() || !formData.content.trim()) {
      alert('El asunto y el contenido son requeridos')
      return
    }

    if (!confirm(`¿Enviar newsletter a ${stats.active} suscriptores activos?`)) {
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
        template: 'custom',
        subject: '',
        preheader: '',
        content: '',
        images: [],
        products: [],
        discount: '',
        couponCode: '',
        expiryDate: '',
        ctaText: 'Ver Productos',
        ctaUrl: 'https://niñamar.com/productos',
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
            Envía correos a tus suscriptores
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
        {/* Editor */}
        <div className={styles.editorSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Crear Newsletter</h2>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={styles.previewButton}
            >
              <Eye size={18} />
              {showPreview ? 'Ocultar' : 'Vista Previa'}
            </button>
          </div>

          <div className={styles.form}>
            {/* Selector de Plantilla */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Plantilla
              </label>
              <select
                name="template"
                value={formData.template}
                onChange={handleInputChange}
                className={styles.input}
              >
                <option value="custom">Newsletter Personalizado</option>
                <option value="product">Anuncio de Productos</option>
                <option value="offer">Oferta Especial</option>
              </select>
            </div>
            {/* Campos condicionales según plantilla */}
            {formData.template === 'custom' && (
              <>
                {/* URL de CTA */}
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

                {/* Gestor simple de imágenes */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Imágenes (URLs separadas por comas)
                  </label>
                  <input
                    type="text"
                    name="imageUrls"
                    onChange={(e) => {
                      const urls = e.target.value.split(',').map(url => url.trim()).filter(Boolean)
                      setFormData(prev => ({
                        ...prev,
                        images: urls.map(url => ({ url, alt: 'Imagen de newsletter' }))
                      }))
                    }}
                    className={styles.input}
                    placeholder="https://ejemplo.com/imagen1.jpg, https://ejemplo.com/imagen2.jpg"
                  />
                  <span className={styles.hint}>
                    Agrega URLs de imágenes separadas por comas
                  </span>
                </div>
              </>
            )}

            {formData.template === 'offer' && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Descuento (Ej: 20% OFF)
                  </label>
                  <input
                    type="text"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="20% OFF"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Código de Cupón (Opcional)
                  </label>
                  <input
                    type="text"
                    name="couponCode"
                    value={formData.couponCode}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="VERANO2025"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Fecha de Expiración
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className={styles.input}
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
              </>
            )}

            {formData.template === 'product' && (
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Productos (JSON)
                </label>
                <textarea
                  name="productsJson"
                  onChange={(e) => {
                    try {
                      const products = JSON.parse(e.target.value)
                      setFormData(prev => ({ ...prev, products }))
                    } catch (error) {
                      // Invalid JSON, ignore
                    }
                  }}
                  className={styles.textarea}
                  placeholder={`[
  {
    "name": "Collar de Plata",
    "image": "https://ejemplo.com/collar.jpg",
    "price": "$45.000",
    "url": "https://niñamar.com/productos/collar"
  }
]`}
                  rows={8}
                />
                <span className={styles.hint}>
                  Formato JSON con nombre, imagen, precio y URL de cada producto
                </span>
              </div>
            )}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Asunto *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Ej: Nuevas joyas de la temporada ✨"
                maxLength={100}
              />
              <span className={styles.hint}>
                {formData.subject.length}/100 caracteres
              </span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Preheader (Texto de vista previa)
              </label>
              <input
                type="text"
                name="preheader"
                value={formData.preheader}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Este texto aparece junto al asunto en la bandeja de entrada"
                maxLength={150}
              />
              <span className={styles.hint}>
                {formData.preheader.length}/150 caracteres
              </span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Contenido *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className={styles.textarea}
                placeholder="Escribe el contenido de tu newsletter aquí...

Puedes usar saltos de línea para separar párrafos.

Consejos:
- Mantén el mensaje claro y conciso
- Incluye un llamado a la acción
- Personaliza el mensaje"
                rows={15}
              />
            </div>

            <div className={styles.actions}>
              <button
                onClick={handleSendNewsletter}
                disabled={isSending || !formData.subject || !formData.content}
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
                    Enviar a {stats.active} suscriptores
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className={styles.previewSection}>
            <h2 className={styles.sectionTitle}>Vista Previa</h2>
            <div className={styles.emailPreview}>
              <div className={styles.emailHeader}>
                <strong>De:</strong> Niñamar &lt;noreply@ninamar.com&gt;<br />
                <strong>Asunto:</strong> {formData.subject || '(Sin asunto)'}
                {formData.preheader && (
                  <>
                    <br />
                    <span className={styles.preheader}>{formData.preheader}</span>
                  </>
                )}
              </div>
              <div className={styles.emailBody}>
                {formData.content ? (
                  formData.content.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph || '\u00A0'}</p>
                  ))
                ) : (
                  <p className={styles.emptyContent}>(Sin contenido)</p>
                )}
              </div>
              <div className={styles.emailFooter}>
                <p>© {new Date().getFullYear()} Niñamar - Popayán, Cauca, Colombia</p>
                <p>
                  <a href="#">Cancelar suscripción</a>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subscribers List */}
      <div className={styles.subscribersSection}>
        <h2 className={styles.sectionTitle}>
          Suscriptores ({stats.active} activos)
        </h2>

        {isLoadingSubscribers ? (
          <div className={styles.loading}>
            <Loader2 size={32} className={styles.spinner} />
            <p>Cargando suscriptores...</p>
          </div>
        ) : subscribers.length === 0 ? (
          <div className={styles.empty}>
            <Mail size={48} />
            <p>No hay suscriptores todavía</p>
          </div>
        ) : (
          <div className={styles.subscribersList}>
            {subscribers.map((subscriber) => (
              <div
                key={subscriber.id}
                className={`${styles.subscriberCard} ${!subscriber.is_active ? styles.subscriberInactive : ''
                  }`}
              >
                <div className={styles.subscriberInfo}>
                  <p className={styles.subscriberEmail}>{subscriber.email}</p>
                  {subscriber.name && (
                    <p className={styles.subscriberName}>{subscriber.name}</p>
                  )}
                </div>
                <div className={styles.subscriberStatus}>
                  {subscriber.is_active ? (
                    <span className={styles.badgeActive}>Activo</span>
                  ) : (
                    <span className={styles.badgeInactive}>Inactivo</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}