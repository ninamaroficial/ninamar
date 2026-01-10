'use client'

import { useRef, useEffect, useState } from 'react'
import Container from "@/components/ui/Container"
import styles from './FeaturesSection.module.css'
import Image from 'next/image'

interface Feature {
  title: string
  description: string
  direction: 'left' | 'right'
  image: string
}

const features: Feature[] = [
  {
    title: "Personalización Total",
    description: "Elige colores, acabados y grabados. Cada pieza es única como tú.",
    direction: 'left',
    image: '/features/imagen1.png'
  },
  {
    title: "Calidad Garantizada",
    description: "Materiales premium y acabados profesionales en cada accesorio.",
    direction: 'right',
    image: '/features/imagen2.png'
  },
  {
    title: "Envío Gratis +$100K",
    description: "Envío a todo Colombia. Gratis en compras superiores a $100.000.",
    direction: 'left',
    image: '/features/imagen3.png'
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
    // Solo activar parallax en desktop
    if (isMobile) return

    const handleScroll = () => {
      setScrollY(window.scrollY)
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
                        quality={75}
                        priority={index < 2}
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