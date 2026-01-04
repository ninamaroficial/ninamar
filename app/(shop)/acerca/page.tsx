import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Container from '@/components/ui/Container'
import { Heart, Sparkles, Package, Users } from 'lucide-react'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Acerca de Nosotros - Niñamar | Accesorios Personalizados',
  description: 'Conoce la historia detrás de Niñamar, cómo nace nuestra pasión por crear accesorios únicos y personalizados hechas a mano en Popayán, Colombia.',
  openGraph: {
    title: 'Acerca de Nosotros - Niñamar',
    description: 'Conoce la historia detrás de Niñamar y nuestra pasión por crear accesorios únicos',
    url: 'https://niñamar.com/acerca',
  },
}

export default function AcercaPage() {
  return (
    <div className={styles.page}>
      {/* Hero Section */}

<section className={styles.hero}>
  <Container>
    <div className={styles.heroContent}>
      <h1 className={styles.heroTitle}>Nuestra Historia</h1>
      <p className={styles.heroSubtitle}>
        Cada accesorio cuenta una historia, y esta es la nuestra
      </p>
    </div>
  </Container>
</section>

      <Container>
        {/* Historia */}
        <section className={styles.story}>
          <div className={styles.storyContent}>
            <div className={styles.storyText}>
              <h2 className={styles.sectionTitle}>Cómo Nace Niñamar</h2>
              <div className={styles.paragraphs}>
                <p>
                  Niñamar nace del amor por el arte y la pasión por crear piezas únicas que cuenten historias. 
                  En el corazón de Popayán, Cauca, comenzamos este viaje con un sueño simple: hacer que cada 
                  persona pueda llevar consigo algo verdaderamente especial.
                </p>
                <p>
                  Lo que comenzó como un pequeño taller en casa, se ha convertido en un espacio donde la creatividad 
                  y la artesanía se encuentran. Cada pieza que creamos lleva consigo horas de dedicación, amor y 
                  atención al detalle.
                </p>
                <p>
                  Creemos que los accesorios son recuerdos tangibles, símbolos de momentos 
                  importantes y expresiones de individualidad. Por eso, cada creación de Niñamar es única, pensada y 
                  hecha especialmente para ti.
                </p>
              </div>
            </div>

            <div className={styles.storyImage}>
              <div className={styles.imageWrapper}>
                <Image
                  src="/images/about-workshop.jpg"
                  alt="Taller Niñamar"
                  width={600}
                  height={400}
                  className={styles.image}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Características de la marca */}
        <section className={styles.values}>
          <h2 className={styles.sectionTitle}>Lo Que Nos Define</h2>
          
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <Heart size={32} />
              </div>
              <h3 className={styles.valueTitle}>Hechas con Amor</h3>
              <p className={styles.valueDescription}>
                Cada pieza es creada a mano con dedicación y cuidado. No hay dos accesorios iguales, 
                porque cada una lleva una parte de nuestra pasión por el arte.
              </p>
            </div>

            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <Sparkles size={32} />
              </div>
              <h3 className={styles.valueTitle}>Personalización Única</h3>
              <p className={styles.valueDescription}>
                Tu accesorio, tu estilo. Ofrecemos infinitas posibilidades de personalización para que 
                cada pieza refleje exactamente lo que deseas expresar.
              </p>
            </div>

            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <Package size={32} />
              </div>
              <h3 className={styles.valueTitle}>Calidad Artesanal</h3>
              <p className={styles.valueDescription}>
                Seleccionamos cuidadosamente cada material y aplicamos técnicas artesanales 
                tradicionales para garantizar piezas duraderas y de alta calidad.
              </p>
            </div>

            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <Users size={32} />
              </div>
              <h3 className={styles.valueTitle}>Atención Personalizada</h3>
              <p className={styles.valueDescription}>
                Te acompañamos en todo el proceso, desde la idea inicial hasta la entrega final. 
                Tu satisfacción es nuestra prioridad.
              </p>
            </div>
          </div>
        </section>

        {/* Nuestro Compromiso */}
        <section className={styles.commitment}>
          <div className={styles.commitmentContent}>
            <h2 className={styles.sectionTitle}>Nuestro Compromiso</h2>
            <div className={styles.commitmentText}>
              <p>
                En Niñamar, nos comprometemos a crear accesorios que no solo embellezcan, sino que también 
                signifiquen algo especial. Trabajamos con materiales de calidad, procesos artesanales 
                cuidadosos y un servicio al cliente excepcional.
              </p>
              <p>
                Cada pedido es tratado con la misma dedicación, ya sea tu primer accesorio con nosotros o 
                el décima. Porque para nosotros, no solo vendes un producto; creamos una experiencia y 
                un recuerdo que perdurará en el tiempo.
              </p>
            </div>
          </div>
        </section>

      </Container>
    </div>
  )
}