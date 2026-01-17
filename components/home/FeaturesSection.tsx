'use client'

import { useRef, useEffect, useState } from 'react'
import Container from "@/components/ui/Container"
import styles from './FeaturesSection.module.css'
import Image from 'next/image'

// Deshabilitar animaciones complejas en móvil para mejorar rendimiento
const isMobileDevice = () => typeof window !== 'undefined' && window.innerWidth <= 768

interface Feature {
  title: string
  description: string
  direction: 'left' | 'right'
  image: string
}

const features: Feature[] = [
  {
    title: "¡Tú lo imaginas y Niñamar lo hace realidad!",
    description: "Elige colores, acabados y tamaños. Cada pieza es tan única como tú",
    direction: 'left',
    image: '/features/perTotal.png'
  },
  {
    title: "¡Lindo por fuera, fuerte por dentro!",
    description: "Calidad garantizada y acabados profesionales en cada accesorio",
    direction: 'right',
    image: '/features/calidad2.png'
  },
  {
    title: "Envío Gratis +$100K",
    description: "Envío a todo Colombia. Gratis en compras superiores a $100.000",
    direction: 'left',
    image: '/features/envioGratis.png'
  }
]

export default function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // Detectar si es móvil
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      window.removeEventListener('resize', checkMobile)
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  useEffect(() => {
    // Deshabilitar parallax en móvil para mejor rendimiento
    if (isMobile) return

    const handleScroll = () => {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => setScrollY(window.scrollY))
      } else {
        setScrollY(window.scrollY)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isMobile])

  const getParallaxStyle = (index: number) => {
    // Desactivar parallax en móvil
    if (isMobile || !sectionRef.current) return {}
    
    const rect = sectionRef.current.getBoundingClientRect()
    const sectionTop = rect.top + window.scrollY
    const offset = scrollY - sectionTop
    
    // Parallax más suave
    const parallaxSpeed = 0.08
    const yOffset = offset * parallaxSpeed * (index % 2 === 0 ? 1 : -1)
    
    return {
      transform: `translateY(${yOffset}px)`
    }
  }

  return (
    <section ref={sectionRef} className={styles.features}>
      {/* Elementos decorativos de fondo */}
      <div className={styles.backgroundDecor}>
        <div className={styles.decorCircle1}></div>
        <div className={styles.decorCircle2}></div>
        <div className={styles.decorCircle3}></div>
      </div>

      <Container>
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div
              key={index}
              className={`${styles.featureWrapper} ${
                isVisible ? styles.visible : ''
              } ${styles[`from-${feature.direction}`]}`}
              style={{
                transitionDelay: `${index * 0.2}s`,
                ...getParallaxStyle(index)
              }}
            >
              <div className={styles.feature}>
                <div className={styles.featureBackground}>
                  <div className={styles.featureBackgroundOverlay}></div>
                </div>

                <div className={styles.featureContent}>
                  {/* Imagen en lugar del ícono */}
                  <div className={styles.featureImageWrapper}>
                    <div className={styles.featureImageContainer}>
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        width={520}
                        height={520}
                        className={styles.featureImage}
                        sizes="(max-width: 480px) 200px, (max-width: 768px) 240px, (max-width: 1024px) 280px, 320px"
                        quality={75}
                        priority={index === 0}
                        loading={index === 0 ? undefined : "lazy"}
                      />
                    </div>
                    <div className={styles.featureImageGlow}></div>
                  </div>

                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureText}>{feature.description}</p>

                  <div className={styles.featureDecoration}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>

                {/* Efecto de brillo que sigue el mouse */}
                <div className={styles.featureShine}></div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}