import Container from "@/components/ui/Container"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { Sparkles, Package, Truck, Shield, ArrowRight, Star } from "lucide-react"
import styles from "./page.module.css"
import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import ProductCarousel from "@/components/home/ProductCarousel"
import { carouselImages, carouselConfig } from '@/lib/carousel-config'

// Lazy load componentes pesados below-the-fold
const FeaturesSection = dynamic(() => import("@/components/home/FeaturesSection"), {
  ssr: true,
})
const HowItWorksSection = dynamic(() => import("@/components/home/HowItWorksSection"), {
  ssr: true,
})

export const metadata: Metadata = {
  title: 'Niñamar - Accesorios Personalizados Hechos a Mano | Popayán, Colombia',
  description: 'Descubre accesorios únicos y personalizados hechos a mano con amor en Popayán, Colombia. Collares, aretes y más. Cada pieza cuenta tu historia.',
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
    description: 'Descubre accesorios únicos y personalizados hechos a mano con amor en Popayán, Colombia. Collares, aretes y más. Cada pieza cuenta tu historia.',
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
  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        {/* Carrusel a pantalla completa */}
        <div className={styles.heroCarousel}>
          <ProductCarousel 
            images={carouselImages} 
            autoPlayInterval={carouselConfig.autoPlayInterval} 
          />
          
          {/* Overlay con gradiente sutil */}
          <div className={styles.heroOverlay}></div>
        </div>
        
        {/* Content flotante sobre el carrusel */}
        <Container>
          <div className={styles.heroContent}>
            {/* Logo o título minimalista */}
            <div className={styles.heroTitle}>
              <h1>Niñamar</h1>
              <p>Accesorios Creativos y coloridos hechos a mano</p>
            </div>
            
            
            {/* CTA Button */}
            <Link href="/productos" className={styles.ctaButton}>
              <span>Explorar Colección</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </Container>
        
      </section>
      
      <FeaturesSection />

      <HowItWorksSection />
      
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