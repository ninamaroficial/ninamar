import Container from "@/components/ui/Container"
import Button from "@/components/ui/Button"
import Link from "next/link"
import Image from "next/image"
import { Sparkles, Package, Truck, Shield, ArrowRight, Star } from "lucide-react"
import styles from "./page.module.css"
import type { Metadata } from 'next'
import ProductCarousel from "@/components/home/ProductCarousel"

export const metadata: Metadata = {
  title: 'Niñamar - Accesorios Personalizados Hechos a Mano | Popayán, Colombia',
  description: 'Descubre accesorios únicos y personalizadas hechas a mano con amor en Popayán, Colombia. Collares, pulseras, aretes y más. Cada pieza cuenta tu historia.',
  keywords: [
    'accesorios personalizadas',
    'joyas artesanales',
    'accesorios artesanales',
    'accesorios popayán',
    'collares personalizados',
    'pulseras hechas a mano',
    'aretes únicos',
    'accesorios colombia',
    'accesorios personalizados',
    'regalos únicos',
    'joyería artesanal colombia'
  ].join(', '),
  openGraph: {
    title: 'Niñamar - Accesorios Artesanales Hechos a Mano',
    description: 'Descubre accesorios únicos y personalizadas hechas a mano con amor en Popayán, Colombia. Collares, pulseras, aretes y más. Cada pieza cuenta tu historia.',
    url: 'https://niñamar.com',
    siteName: 'Niñamar',
    images: [
      {
        url: 'https://niñamar.com/icon.png',
        width: 1200,
        height: 630,
        alt: 'Niñamar - Accesorios Personalizados',
      },
    ],
    locale: 'es_CO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Niñamar - Accesorios Personalizados',
    description: 'Descubre accesorios únicos y personalizadas hechas a mano con amor.',
    images: ['https://niñamar.com/icon.png'],
  },
  alternates: {
    canonical: 'https://niñamar.com',
  },
}

export default function Home() {
  // Array de imágenes para el carrusel
  const carouselImages = [
    {
      url: 'https://xxzksnruxbaqemtebgln.supabase.co/storage/v1/object/public/product_images/Bananita/Bananita-1.png',
      alt: 'Bananita - Accesorios personalizados'
    },
    {
      url: 'https://xxzksnruxbaqemtebgln.supabase.co/storage/v1/object/public/product_images/Rainbow/Rainbow-1.png',
      alt: 'Rainbow - Accesorios personalizados'
    }
  ]
  
  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={styles.gradientOrb1}></div>
          <div className={styles.gradientOrb2}></div>
          <div className={styles.gradientOrb3}></div>
        </div>
        
        <Container>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <span className={styles.badge}>
                <Sparkles size={16} />
                Accesorios Artesanales
              </span>
              <h1 className={styles.heroTitle}>
                Diseña Tu Accesorio
                <span className={styles.heroTitleGradient}> Perfecto</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Crea piezas únicas que cuenten tu historia. Personaliza cada detalle: 
                colores, acabados y grabados exclusivos.
              </p>
              <div className={styles.heroButtons}>
                <Link href="/productos">
                  <Button size="lg" className={styles.primaryButton}>
                    Comenzar a Diseñar
                    <ArrowRight size={20} />
                  </Button>
                </Link>
                <Link href="/seguimiento">
                  <Button variant="outline" size="lg" className={styles.secondaryButton}>
                    Rastrear Pedido
                  </Button>
                </Link>
              </div>
              
              {/* Stats */}
              <div className={styles.stats}>
                {/* STAT CON LINK A GOOGLE REVIEWS */}
                <Link
                  href="https://share.google/Pdv59OhmhXXC719Ge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.statLink}
                >
                  <Star className={styles.statIcon} size={20} />
                  <div className={styles.statContent}>
                    <span className={styles.statNumber}>5.0</span>
                    <span className={styles.statLabel}>
                      Google Reviews
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 12 12"
                        fill="none"
                        style={{ marginLeft: '4px', display: 'inline-block', verticalAlign: 'middle' }}
                      >
                        <path
                          d="M10 1L2 9M10 1H3M10 1V8"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                </Link>
                
                <div className={styles.stat}>
                  <Package className={styles.statIcon} size={20} />
                  <div className={styles.statContent}>
                    <span className={styles.statNumber}>1000+</span>
                    <span className={styles.statLabel}>Accesorios Creados</span>
                  </div>
                </div>
                
                <div className={styles.stat}>
                  <Truck className={styles.statIcon} size={20} />
                  <div className={styles.statContent}>
                    <span className={styles.statNumber}>Envío</span>
                    <span className={styles.statLabel}>A Todo Colombia</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.heroImage}>
              <div className={styles.imageWrapper}>
                <div className={styles.floatingCard}>
                  <div className={styles.cardIcon}>
                    <Sparkles size={24} />
                  </div>
                  <div className={styles.cardContent}>
                    <p className={styles.cardTitle}>100% Personalizable</p>
                    <p className={styles.cardText}>Diseña a tu gusto</p>
                  </div>
                </div>
                
                {/* Carrusel de productos */}
                <div className={styles.productShowcase}>
                  <ProductCarousel images={carouselImages} autoPlayInterval={5000} />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <Container>
          <div className={styles.featuresGrid}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <Sparkles size={28} />
              </div>
              <h3 className={styles.featureTitle}>Personalización Total</h3>
              <p className={styles.featureText}>
                Elige colores, acabados y grabados. Cada pieza es única como tú.
              </p>
            </div>
            
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <Shield size={28} />
              </div>
              <h3 className={styles.featureTitle}>Calidad Garantizada</h3>
              <p className={styles.featureText}>
                Materiales premium y acabados profesionales en cada accesorio.
              </p>
            </div>
            
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <Truck size={28} />
              </div>
              <h3 className={styles.featureTitle}>Envío Gratis +$100K</h3>
              <p className={styles.featureText}>
                Envío a todo Colombia. Gratis en compras superiores a $100.000.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks}>
        <Container>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>Proceso Simple</span>
            <h2 className={styles.sectionTitle}>¿Cómo Funciona?</h2>
            <p className={styles.sectionSubtitle}>
              Crea tu accesorio perfecto en 3 simples pasos
            </p>
          </div>

          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>
                <span>01</span>
              </div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Elige tu Producto</h3>
                <p className={styles.stepText}>
                  Explora nuestra colección y selecciona la pieza base que más te guste.
                </p>
              </div>
              <div className={styles.stepConnector}></div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>
                <span>02</span>
              </div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Personaliza</h3>
                <p className={styles.stepText}>
                  Elige colores, acabados y agrega un grabado especial. Ve los cambios en tiempo real.
                </p>
              </div>
              <div className={styles.stepConnector}></div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>
                <span>03</span>
              </div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Recibe en Casa</h3>
                <p className={styles.stepText}>
                  Realizamos tu pedido con cuidado y lo enviamos directamente a tu puerta.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.ctaCenter}>
            <Link href="/productos">
              <Button size="lg" className={styles.ctaButton}>
                Comenzar Ahora
                <ArrowRight size={20} />
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* Trust Section */}
      <section className={styles.trust}>
        <Container>
          <div className={styles.trustContent}>
            <div className={styles.trustText}>
              <h2 className={styles.trustTitle}>
                Más de 1000 clientes satisfechos
              </h2>
              <p className={styles.trustSubtitle}>
                Accesorios únicos que cuentan historias únicas
              </p>
            </div>
            
            <div className={styles.trustStats}>
              <div className={styles.trustStat}>
                <span className={styles.trustNumber}>5.0/5</span>
                <span className={styles.trustLabel}>Calificación promedio</span>
              </div>
              <div className={styles.trustStat}>
                <span className={styles.trustNumber}>1000+</span>
                <span className={styles.trustLabel}>Accesorios entregados</span>
              </div>
              <div className={styles.trustStat}>
                <span className={styles.trustNumber}>98%</span>
                <span className={styles.trustLabel}>Clientes satisfechos</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Final */}
      <section className={styles.finalCta}>
        <Container>
          <div className={styles.finalCtaContent}>
            <h2 className={styles.finalCtaTitle}>
              ¿Lista para crear tu accesorio único?
            </h2>
            <p className={styles.finalCtaText}>
              Diseña, personaliza y recibe una pieza única hecha especialmente para ti
            </p>
            <Link href="/productos">
              <Button size="lg" className={styles.finalCtaButton}>
                Explorar Colección
                <ArrowRight size={20} />
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </div>
  )
}