"use client"

import { useState, useEffect } from 'react'
import Container from "@/components/ui/Container"
import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"
import styles from "./footer.module.css"

// Importa el ícono de TikTok como SVG personalizado
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  )
}
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

  const footerImages = [
  "/images/footerimages/arcoiris-original2.png",
  "/images/footerimages/flor.png",
  "/images/footerimages/collar-amarillo.png",
  "/images/footerimages/barco-amarillo.png",
  "/images/footerimages/banana-amarilla.png",
  "/images/footerimages/banana-azul.png",
  "/images/footerimages/barco-azul.png",
  "/images/footerimages/arcoiris-azul.png",
  "/images/footerimages/barco-blanco.png",
  "/images/footerimages/collar-azul.png",
]

// “Slots” (posiciones) — NO se enciman porque son distintos
const SLOTS = [
  { x: "6%",  y: "12%", size: 170, rot: -8, dur: 18 },
  { x: "18%", y: "55%", size: 140, rot: 6,  dur: 22 },
  { x: "8%",  y: "78%", size: 160, rot: -3, dur: 20 },

  { x: "40%", y: "18%", size: 190, rot: 7,  dur: 24 },
  { x: "46%", y: "62%", size: 150, rot: -6, dur: 19 },
  { x: "38%", y: "82%", size: 130, rot: 4,  dur: 21 },

  { x: "72%", y: "14%", size: 180, rot: -7, dur: 20 },
  { x: "84%", y: "46%", size: 150, rot: 5,  dur: 23 },
  { x: "76%", y: "78%", size: 170, rot: 2,  dur: 19 },

  { x: "92%", y: "20%", size: 130, rot: 9,  dur: 25 },
  { x: "92%", y: "78%", size: 140, rot: -5, dur: 22 },
] as const

// cuántas quieres mostrar
const DECOR_COUNT = 10 // pon 5, 7, 9...

type DecoItem = {
  src: string
  slot: (typeof SLOTS)[number]
}

// ✅ OPTIMIZACIÓN CLS: Calcular posiciones en build time, no en runtime
// Esto previene layout shifts porque las imágenes siempre están en las mismas posiciones
const decorativeImages: DecoItem[] = footerImages.slice(0, DECOR_COUNT).map((src, i) => ({
  src,
  slot: SLOTS[i]
}))



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
      {/* ✅ OPTIMIZACIÓN CLS: Imágenes decorativas con contenedor de altura fija */}
      <div className={styles.decorativeImages} aria-hidden="true">
        {decorativeImages.map((item, index) => (
          <Image
            key={`${item.src}-${index}`}
            src={item.src}
            alt=""
            width={item.slot.size}
            height={item.slot.size}
            className={styles.decorativeImage}
            loading="lazy"
            quality={60}
            style={{
              // CSS variables para posición / tamaño / rotación
              ["--x" as any]: item.slot.x,
              ["--y" as any]: item.slot.y,
              ["--s" as any]: `${item.slot.size}px`,
              ["--r" as any]: `${item.slot.rot}deg`,
              ["--d" as any]: `${item.slot.dur}s`,
            }}
          />
        ))}
      </div>


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
                Creando accesorios únicos y personalizados que cuentan tu historia.
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
                  href="https://www.tiktok.com/@ninamar_oficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="TikTok"
                >
                  <TikTokIcon className={styles.socialIcon} />
                </a>
                <a
                  href="mailto:ninamar.oficial@gmail.com"
                  className={styles.socialLink}
                  aria-label="Email"
                >
                  <Mail className={styles.socialIcon} />
                </a>
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
                  {isSubmitting ? 'Enviando...' : 'Suscribirme'}
                </button>
              </form>

              {message && (
                <p className={`${styles.newsletterMessage} ${message.type === 'success' ? styles.messageSuccess : styles.messageError
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
              <span>Hecho con <span className={styles.heart}>♥</span> en Popayán - Colombia</span>
            </div>

            {/* Métodos de Pago */}
            <div className={styles.paymentMethods}>
              <span className={styles.paymentText}>Pagos seguros con:</span>
              <div className={styles.paymentLogos}>
                {/* Logo de MercadoPago */}
                <Image
                  src="/mercadopago-logo.png"
                  alt="MercadoPago"
                  width={120}
                  height={24}
                  className={styles.mercadopagoLogo}
                />
              </div>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  )
}