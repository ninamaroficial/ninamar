"use client"

import { useState } from 'react'
import Container from "@/components/ui/Container"
import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"
import styles from "./footer.module.css"

export default function Footer() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const footerLinks = {
    company: [
      { name: "Acerca de Nosotros", href: "/acerca" },
      { name: "Trabaja con Nosotros", href: "/contacto" },
    ],
    support: [
      { name: "Centro de Ayuda", href: "/contacto" },
      { name: "Envíos y Entregas", href: "/Seguimiento" }
    ],
    legal: [
      { name: "Términos y Condiciones", href: "/terminos" },
      { name: "Política de Privacidad", href: "/privacidad" },
      { name: "Política de Cookies", href: "/cookies" },
      { name: "Aviso Legal", href: "/aviso-legal" },
    ],
  }

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setMessage({ type: 'error', text: 'Por favor ingresa tu email' })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'footer'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al suscribirse')
      }

      setMessage({ type: 'success', text: data.message })
      setEmail('')
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      {/* Sección Superior */}
      <div className={styles.topSection}>
        <Container>
          <div className={styles.content}>
            {/* Sección de la Marca */}
            <div className={styles.brandSection}>
              <Link href="/" className={styles.logo}>
                <span className={styles.logoText}>Niñamar</span>
              </Link>
              
              <p className={styles.brandDescription}>
                Creando accesorios únicas y personalizadas que cuentan tu historia. 
                Cada pieza es una obra de arte hecha con amor y dedicación.
              </p>

              {/* Redes Sociales */}
              <div className={styles.socialLinks}>
                <a 
                  href="https://www.facebook.com/profile.php?id=61585522993204" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="Facebook"
                >
                  <Facebook className={styles.socialIcon} />
                </a>
                <a 
                  href="https://www.instagram.com/ninamar_oficial/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="Instagram"
                >
                  <Instagram className={styles.socialIcon} />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="Twitter"
                >
                  <Twitter className={styles.socialIcon} />
                </a>
                <a 
                  href="ninamar.oficial@gmail.com"
                  className={styles.socialLink}
                  aria-label="Email"
                >
                  <Mail className={styles.socialIcon} />
                </a>
              </div>

              {/* Contacto rápido para móvil */}
              <div className={styles.quickContact}>
                <div className={styles.contactItem}>
                  <div className={styles.contactIcon}>
                    <Phone size={16} />
                  </div>
                  <span>+57 300 123 4567</span>
                </div>
                <div className={styles.contactItem}>
                  <div className={styles.contactIcon}>
                    <Mail size={16} />
                  </div>
                  <span>contacto@ninamar.com</span>
                </div>
                <div className={styles.contactItem}>
                  <div className={styles.contactIcon}>
                    <MapPin size={16} />
                  </div>
                  <span>Popayán, Cauca, Colombia</span>
                </div>
              </div>
            </div>

            {/* Links de Compañía */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Compañía</h4>
              <ul className={styles.linkList}>
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className={styles.link}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Links de Soporte */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Soporte</h4>
              <ul className={styles.linkList}>
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className={styles.link}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className={styles.newsletterSection}>
              <h4 className={styles.sectionTitle}>Newsletter</h4>
              <p className={styles.newsletterText}>
                Suscríbete para recibir ofertas exclusivas y novedades sobre nuestras colecciones.
              </p>
              <form onSubmit={handleNewsletterSubmit} className={styles.newsletterForm}>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.newsletterInput}
                  required
                  disabled={isSubmitting}
                />
                <button 
                  type="submit" 
                  className={styles.newsletterButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando...' : 'Suscribirme ✨'}
                </button>
              </form>
              
              {message && (
                <p className={`${styles.newsletterMessage} ${
                  message.type === 'success' ? styles.messageSuccess : styles.messageError
                }`}>
                  {message.text}
                </p>
              )}
              
              <p className={styles.privacyNote}>
                Al suscribirte, aceptas nuestra{' '}
                <Link href="/privacidad" className={styles.privacyLink}>
                  política de privacidad
                </Link>
              </p>
            </div>
          </div>
        </Container>
      </div>

      {/* Sección Inferior */}
      <div className={styles.bottomSection}>
        <Container>
          <div className={styles.bottomContent}>
            <div className={styles.copyright}>
              <span>© {currentYear} Niñamar.</span>
              <span>Hecho con <span className={styles.heart}>♥</span> en Colombia</span>
            </div>

            {/* Métodos de Pago */}
            <div className={styles.paymentMethods}>
              <span className={styles.paymentText}>Aceptamos:</span>
              <div className={styles.paymentIcon} title="Visa">💳</div>
              <div className={styles.paymentIcon} title="Mastercard">💳</div>
              <div className={styles.paymentIcon} title="PSE">💰</div>
              <div className={styles.paymentIcon} title="Transferencia">🏦</div>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  )
}