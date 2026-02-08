import type { Metadata } from 'next'
import Image from 'next/image'
import Container from '@/components/ui/Container'
import ContactForm from '@/components/contact/ContactForm'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Contacto - Niñamar | Accesorios Personalizados',
  description: 'Contáctanos para consultas, pedidos personalizados o cualquier pregunta sobre nuestros accesorios. Estamos en Popayán, Cauca, Colombia.',
  openGraph: {
    title: 'Contacto - Niñamar',
    description: 'Contáctanos para consultas y pedidos personalizados',
    url: 'https://niñamar.com/contacto',
  },
}

export default function ContactoPage() {
  return (
    <div className={styles.page}>
      {/* Hero */}

<section className={styles.hero}>
  <Container>
    <div className={styles.heroContent}>

    </div>
  </Container>
</section>

      <Container>
        <div className={styles.content}>
          {/* Información de contacto */}
          <div className={styles.infoSection}>
            <h2 className={styles.sectionTitle}>Información de Contacto</h2>
            
            <div className={styles.infoCards}>
              <div className={styles.infoCard}>
                <div className={styles.iconWrapper}>
                  <Image
                    src="/contacto/email.png"
                    alt="Email"
                    width={48}
                    height={48}
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className={styles.infoContent}>
                  <h3 className={styles.infoTitle}>Email</h3>
                  <a href="mailto:ninamar.oficial@gmail.com" target="_blank"  className={styles.infoLink}>
                    ninamar.oficial@gmail.com
                  </a>
                  <p className={styles.infoText}>
                    Respondemos en menos de 24 horas
                  </p>
                </div>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.iconWrapper}>
                  <Image
                    src="/contacto/wpp.png"
                    alt="WhatsApp"
                    width={48}
                    height={48}
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className={styles.infoContent}>
                  <h3 className={styles.infoTitle}>WhatsApp</h3>
                  <a href="https://api.whatsapp.com/send?phone=573005469257&text=Hola,%20quiero%20conocer%20los%20productos%20de%20Niñamar%20❤️" target="_blank"  className={styles.infoLink}>
                    +57 300 546 9257
                  </a>
                  <p className={styles.infoText}>
                    Lun - Sáb: 9:00 AM - 6:00 PM
                  </p>
                </div>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.iconWrapper}>
                  <Image
                    src="/contacto/ubicación.png"
                    alt="Ubicación"
                    width={48}
                    height={48}
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className={styles.infoContent}>
                  <h3 className={styles.infoTitle}>Ubicación</h3>
                  <p className={styles.infoLink}>
                    Popayán, Cauca
                  </p>
                  <p className={styles.infoText}>
                    Colombia
                  </p>
                </div>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.iconWrapper}>
                  <Image
                    src="/contacto/ubicación.png"
                    alt="Horario"
                    width={48}
                    height={48}
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className={styles.infoContent}>
                  <h3 className={styles.infoTitle}>Horario de Atención</h3>
                  <p className={styles.infoLink}>
                    Lunes - Sábado
                  </p>
                  <p className={styles.infoText}>
                    9:00 AM - 6:00 PM
                  </p>
                </div>
              </div>
            </div>

            {/* Redes Sociales */}
            <div className={styles.socialSection}>
              <h3 className={styles.socialTitle}>Síguenos en Redes Sociales</h3>
              <div className={styles.socialLinks}>
                <a 
                  href="https://www.instagram.com/ninamar_oficial" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  <Image
                    src="/contacto/Instagram.png"
                    alt="Instagram"
                    width={24}
                    height={24}
                  />
                  Instagram
                </a>
                <a 
                  href="https://www.facebook.com/profile.php?id=61585970772454" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  <Image
                    src="/contacto/facebook.png"
                    alt="Facebook"
                    width={24}
                    height={24}
                  />
                  Facebook
                </a>
                <a 
                  href="https://wa.me/573005469257" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  <Image
                    src="/contacto/whatssaoo.png"
                    alt="WhatsApp"
                    width={24}
                    height={24}
                  />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Formulario de contacto */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Envíanos un Mensaje</h2>
            <p className={styles.formDescription}>
              ¿Tienes alguna pregunta o necesitas ayuda con un pedido personalizado? 
              Completa el formulario y te responderemos lo antes posible.
            </p>
            <ContactForm />
          </div>
        </div>
      </Container>
    </div>
  )
}