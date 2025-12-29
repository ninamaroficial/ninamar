import Container from "@/components/ui/Container"
import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, CreditCard } from "lucide-react"
import styles from "./footer.module.css"

export default function Footer() {
  const footerLinks = {
    company: [
      { name: "Acerca de Nosotros", href: "/acerca" },
      { name: "Nuestra Historia", href: "/historia" },
      { name: "Blog de Joyas", href: "/blog" },
      { name: "Trabaja con Nosotros", href: "/carreras" },
    ],
    support: [
      { name: "Centro de Ayuda", href: "/ayuda" },
      { name: "Guía de Tallas", href: "/guia-tallas" },
      { name: "Envíos y Entregas", href: "/envios" },
      { name: "Devoluciones", href: "/devoluciones" },
      { name: "Garantía", href: "/garantia" },
    ],
    legal: [
      { name: "Términos y Condiciones", href: "/terminos" },
      { name: "Política de Privacidad", href: "/privacidad" },
      { name: "Política de Cookies", href: "/cookies" },
      { name: "Aviso Legal", href: "/aviso-legal" },
    ],
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
                Creando joyas únicas y personalizadas que cuentan tu historia. 
                Cada pieza es una obra de arte hecha con amor y dedicación.
              </p>

              {/* Redes Sociales */}
              <div className={styles.socialLinks}>
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="Facebook"
                >
                  <Facebook className={styles.socialIcon} />
                </a>
                <a 
                  href="https://instagram.com" 
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
                  href="mailto:contacto@ninamar.com"
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
              <form className={styles.newsletterForm}>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className={styles.newsletterInput}
                  required
                />
                <button type="submit" className={styles.newsletterButton}>
                  Suscribirme ✨
                </button>
              </form>
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