import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Container from '@/components/ui/Container'
import { Heart, Sparkles, Package, Users, Award, Palette, Clock, Star } from 'lucide-react'
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
      {/* Hero Section - SIN CAMBIOS */}
      <section className={styles.hero}>
        <Container>
          <div className={styles.heroContent}>

          </div>
        </Container>
      </section>

      {/* Historia con diseño mejorado */}
      <section className={styles.storySection}>
        <Container>
          <div className={styles.storyLayout}>
            {/* Columna izquierda - Texto */}
            <div className={styles.storyContent}>
              <div className={styles.storyBadge}>
                <Sparkles size={20} />
                <span>Desde 2025</span>
              </div>
              
              <h2 className={styles.storyTitle}>
                Cómo Nace <span className={styles.titleAccent}>Niñamar</span>
              </h2>
              
              <div className={styles.storyText}>
                <p>
                  <strong>Niñamar nace del amor por el arte</strong> y la pasión por crear piezas únicas que cuenten historias. 
                  En el corazón de Popayán, Cauca, comenzamos este viaje con un sueño simple: hacer que cada 
                  persona pueda llevar consigo algo verdaderamente especial.
                </p>
                <p>
                  Lo que comenzó como un pequeño taller en casa, se ha convertido en un espacio donde <strong>la creatividad 
                  y la artesanía se encuentran</strong>. Cada pieza que creamos lleva consigo horas de dedicación, amor y 
                  atención al detalle.
                </p>
                <p>
                  Creemos que los accesorios son <strong>recuerdos tangibles</strong>, símbolos de momentos 
                  importantes y expresiones de individualidad. Por eso, cada creación de Niñamar es única, pensada y 
                  hecha especialmente para ti.
                </p>
              </div>

              {/* Stats */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statNumber}>muchos</div>
                  <div className={styles.statLabel}>Clientes Felices</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statNumber}>100+</div>
                  <div className={styles.statLabel}>Piezas Creadas</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statNumber}>100%</div>
                  <div className={styles.statLabel}>Hechas a Mano</div>
                </div>
              </div>
            </div>

            {/* Columna derecha - Imágenes */}
            <div className={styles.storyImages}>
              <div className={styles.imageGrid}>
                <div className={`${styles.imageCard} ${styles.imageLarge}`}>
                  <Image
                    src="/acercade/acercade1.jpeg"
                    alt="Taller Niñamar"
                    fill
                    className={styles.image}
                  />
                  <div className={styles.imageOverlay}>
                    <Heart size={24} />
                    <span>Nuestro Taller</span>
                  </div>
                </div>
                
                <div className={`${styles.imageCard} ${styles.imageSmall1}`}>
                  <Image
                    src="/acercade/acercade2.jpeg"
                    alt="Detalles artesanales"
                    fill
                    className={styles.image}
                  />
                </div>
                
                <div className={`${styles.imageCard} ${styles.imageSmall2}`}>
                  <Image
                    src="/acercade/acercade3.jpeg"
                    alt="Proceso de creación"
                    fill
                    className={styles.image}
                  />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Valores con diseño de timeline */}
      <section className={styles.valuesSection}>
        <Container>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Lo Que Nos Define</h2>
            <p className={styles.sectionSubtitle}>
              Cuatro pilares que guían cada creación de Niñamar
            </p>
          </div>

          <div className={styles.valuesTimeline}>
            <div className={styles.valueItem}>
              <div className={styles.valueIconWrapper}>
                <div className={styles.valueIconCircle}>
                  <Heart size={32} />
                </div>
                <div className={styles.timelineLine}></div>
              </div>
              <div className={styles.valueContent}>
                <h3 className={styles.valueTitle}>Hechas con Amor</h3>
                <p className={styles.valueDescription}>
                  Cada pieza es creada a mano con dedicación y cuidado. No hay dos accesorios iguales, 
                  porque cada una lleva una parte de nuestra pasión por el arte.
                </p>
                <div className={styles.valueFeatures}>
                  <span className={styles.featureTag}>Artesanal</span>
                  <span className={styles.featureTag}>Único</span>
                  <span className={styles.featureTag}>Auténtico</span>
                </div>
              </div>
            </div>

            <div className={styles.valueItem}>
              <div className={styles.valueIconWrapper}>
                <div className={styles.valueIconCircle}>
                  <Sparkles size={32} />
                </div>
                <div className={styles.timelineLine}></div>
              </div>
              <div className={styles.valueContent}>
                <h3 className={styles.valueTitle}>Personalización Única</h3>
                <p className={styles.valueDescription}>
                  Tu accesorio, tu estilo. Ofrecemos infinitas posibilidades de personalización para que 
                  cada pieza refleje exactamente lo que deseas expresar.
                </p>
                <div className={styles.valueFeatures}>
                  <span className={styles.featureTag}>A tu medida</span>
                  <span className={styles.featureTag}>Colores</span>
                  <span className={styles.featureTag}>Diseños</span>
                </div>
              </div>
            </div>

            <div className={styles.valueItem}>
              <div className={styles.valueIconWrapper}>
                <div className={styles.valueIconCircle}>
                  <Package size={32} />
                </div>
                <div className={styles.timelineLine}></div>
              </div>
              <div className={styles.valueContent}>
                <h3 className={styles.valueTitle}>Calidad Artesanal</h3>
                <p className={styles.valueDescription}>
                  Seleccionamos cuidadosamente cada material y aplicamos técnicas artesanales 
                  tradicionales para garantizar piezas duraderas y de alta calidad.
                </p>
                <div className={styles.valueFeatures}>
                  <span className={styles.featureTag}>Materiales Premium</span>
                  <span className={styles.featureTag}>Duradero</span>
                  <span className={styles.featureTag}>Garantía</span>
                </div>
              </div>
            </div>

            <div className={styles.valueItem}>
              <div className={styles.valueIconWrapper}>
                <div className={styles.valueIconCircle}>
                  <Users size={32} />
                </div>
              </div>
              <div className={styles.valueContent}>
                <h3 className={styles.valueTitle}>Atención Personalizada</h3>
                <p className={styles.valueDescription}>
                  Te acompañamos en todo el proceso, desde la idea inicial hasta la entrega final. 
                  Tu satisfacción es nuestra prioridad.
                </p>
                <div className={styles.valueFeatures}>
                  <span className={styles.featureTag}>Asesoría</span>
                  <span className={styles.featureTag}>Seguimiento</span>
                  <span className={styles.featureTag}>Soporte 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>


      {/* Compromiso con diseño mejorado */}
      <section className={styles.commitmentSection}>
        <Container>
          <div className={styles.commitmentCard}>
            <div className={styles.commitmentContent}>
              <div className={styles.commitmentBadge}>
                <Heart size={20} />
                <span>Nuestro Compromiso</span>
              </div>
              
              <h2 className={styles.commitmentTitle}>
                Más Que Accesorios, <span className={styles.titleAccent}>Creamos Experiencias</span>
              </h2>
              
              <div className={styles.commitmentText}>
                <p>
                  En Niñamar, nos comprometemos a crear accesorios que no solo embellezcan, sino que también 
                  signifiquen algo especial. Trabajamos con <strong>materiales de calidad</strong>, procesos artesanales 
                  cuidadosos y un servicio al cliente excepcional.
                </p>
                <p>
                  Cada pedido es tratado con la misma dedicación, ya sea tu primer accesorio con nosotros o 
                  el décimo. Porque para nosotros, no solo vendemos un producto; <strong>creamos una experiencia y 
                  un recuerdo</strong> que perdurará en el tiempo.
                </p>
              </div>

              
            </div>

            <div className={styles.commitmentImage}>
              <Image
                src="/acercade/acercadeFinal.png"
                alt="Compromiso Niñamar"
                fill
                className={styles.image}
              />
              <div className={styles.imageDecoration}></div>
            </div>
          </div>
        </Container>
      </section>

    </div>
  )
}