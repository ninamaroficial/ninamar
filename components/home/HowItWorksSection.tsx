'use client'

import { useRef, useEffect, useState } from 'react'
import Container from "@/components/ui/Container"
import styles from './HowItWorksSection.module.css'
import dynamic from 'next/dynamic'
import Image from 'next/image'

// Importar el viewer 3D dinámicamente (solo client-side)
const ProductViewer3D = dynamic(() => import('./ProductViewer3D'), {
  ssr: false,
  loading: () => <div className={styles.viewerLoading}>Cargando modelo 3D...</div>
})

const decoItems = [
  // Sparkles (1–6)
  { cls: `${styles.sparkle} ${styles.sparkle1}`, src: "/hero/iconos/1.png", size: 52 },
  { cls: `${styles.sparkle} ${styles.sparkle2}`, src: "/hero/iconos/2.png", size: 52 },
  { cls: `${styles.sparkle} ${styles.sparkle3}`, src: "/hero/iconos/3.png", size: 52 },
  { cls: `${styles.sparkle} ${styles.sparkle4}`, src: "/hero/iconos/4.png", size: 52 },
  { cls: `${styles.sparkle} ${styles.sparkle5}`, src: "/hero/iconos/5.png", size: 52 },
  { cls: `${styles.sparkle} ${styles.sparkle6}`, src: "/hero/iconos/6.png", size: 52 },

  // Hearts (7–8)
  { cls: `${styles.heart} ${styles.heart1}`, src: "/hero/iconos/7.png", size: 44 },
  { cls: `${styles.heart} ${styles.heart2}`, src: "/hero/iconos/8.png", size: 44 },

  // Extra decor (9–12)
  { cls: `${styles.sparkle} ${styles.sparkle7}`, src: "/hero/iconos/9.png", size: 46 },
  { cls: `${styles.sparkle} ${styles.sparkle8}`, src: "/hero/iconos/10.png", size: 46 },
  { cls: `${styles.sparkle} ${styles.sparkle9}`, src: "/hero/iconos/11.png", size: 46 },
  { cls: `${styles.sparkle} ${styles.sparkle10}`, src: "/hero/iconos/12.png", size: 46 },
]

// Anotaciones personalizables del producto
const annotations = [
  {
    id: 1,
    position: { x: 48, y: 20 },
    label: "Broches personalizables",
    description: "Elige entre diferentes tipos de broches",
  },
  {
    id: 2,
    position: { x: 40, y: 45 },
    label: "Colores personalizables",
    description: "Agrega tu toque personal",
  },
  {
    id: 3,
    position: { x: 60, y: 66 },
    label: "Acabados personalizables",
    description: "Escoge el acabado: Mate o brillante",
  }
]

export default function HowItWorksSection() {
  const [isStep3Visible, setIsStep3Visible] = useState(false)
  const [activeAnnotationId, setActiveAnnotationId] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isMainTitleVisible, setIsMainTitleVisible] = useState(false)
  const [isStep1Visible, setIsStep1Visible] = useState(false)
  const annotationsRef = useRef<HTMLDivElement | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const step3Ref = useRef<HTMLDivElement>(null)
  const mainHeaderRef = useRef<HTMLDivElement>(null)
  const step1Ref = useRef<HTMLDivElement>(null)
  const isTogglingRef = useRef(false)

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Efecto parallax basado en scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return

      const section = sectionRef.current
      const rect = section.getBoundingClientRect()
      const windowHeight = window.innerHeight

      // Calcular progreso de scroll de la sección (0 = top fuera de vista, 1 = bottom fuera de vista)
      const scrollTop = -rect.top
      const sectionHeight = rect.height
      const progress = Math.max(0, Math.min(1, scrollTop / (sectionHeight + windowHeight)))

      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Llamar una vez al montar

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Observer para animaciones de entrada
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === step3Ref.current) {
            setIsStep3Visible(entry.isIntersecting)
          } else if (entry.target === mainHeaderRef.current) {
            setIsMainTitleVisible(entry.isIntersecting)
          } else if (entry.target === step1Ref.current) {
            setIsStep1Visible(entry.isIntersecting)
          }
        })
      },
      { threshold: 0.2, rootMargin: '0px 0px -100px 0px' }
    )

    if (step3Ref.current) observer.observe(step3Ref.current)
    if (mainHeaderRef.current) observer.observe(mainHeaderRef.current)
    if (step1Ref.current) observer.observe(step1Ref.current)

    return () => {
      if (step3Ref.current) observer.unobserve(step3Ref.current)
      if (mainHeaderRef.current) observer.unobserve(mainHeaderRef.current)
      if (step1Ref.current) observer.unobserve(step1Ref.current)
    }
  }, [])

  // ✅ Cerrar tooltip al hacer click/tocar fuera
  useEffect(() => {
    if (activeAnnotationId === null) return

    const handleClickOutside = (e: Event) => {
      if (isTogglingRef.current) return

      const target = e.target as HTMLElement

      // Verificar si el click/touch fue dentro de las anotaciones
      const clickedInsideAnnotation = target.closest('[data-annotation]')

      if (!clickedInsideAnnotation) {
        setActiveAnnotationId(null)
      }
    }

    // Pequeño delay para evitar que se cierre inmediatamente al abrir
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('touchend', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('touchend', handleClickOutside)
    }
  }, [activeAnnotationId])

  const toggleAnnotation = (id: number) => {
    isTogglingRef.current = true

    setActiveAnnotationId(prev => {
      const newId = prev === id ? null : id
      console.log('Toggle annotation:', { from: prev, to: newId, id })
      return newId
    })

    // Resetear la bandera
    setTimeout(() => {
      isTogglingRef.current = false
    }, 150)
  }

  return (
    <section ref={sectionRef} className={styles.howItWorks}>
      <Container>
        {/* Header Principal */}
        <div
          ref={mainHeaderRef}
          className={`${styles.mainHeader} ${isMainTitleVisible ? styles.parallaxVisible : ''}`}
        >
          <div
            className={styles.titleImageWrapper}
            style={{
              transform: `translateY(${scrollProgress * 150}px) scale(${1 - scrollProgress * 0.15})`,
              opacity: 1 - scrollProgress * 0.5
            }}
          >
            <Image
              src="/hero/titles/como-funciona.png"
              alt="¿Cómo Funciona?"
              width={1800}
              height={600}
              className={styles.titleImage}
              quality={75}
              priority
            />
          </div>
        </div>

        {/* Step 1 y 2: Viewer 3D con anotaciones */}
        <div className={styles.stepsContainer}>
          <div
            ref={step1Ref}
            className={`${styles.step3DContainer} ${isStep1Visible ? styles.parallaxVisible : ''}`}
          >
            {/* Título Script Grande */}
            <div
              className={styles.stepTitleWrapper}
              style={{
                transform: `translateY(${scrollProgress * -80}px) scale(${1 + scrollProgress * 0.1})`,
                opacity: 1 - scrollProgress * 0.4
              }}
            >
              <Image
                src="/hero/titles/elige-tu-producto.png"
                alt="Elige tu producto y personalízalo"
                width={1200}
                height={300}
                className={styles.stepTitleImage}
                quality={75}
                priority
              />
            </div>

            {/* Texto descriptivo */}
            <div
              className={styles.step3Content}
              style={{
                transform: `translateY(${scrollProgress * -60}px)`,
                opacity: 1 - scrollProgress * 0.3
              }}
            >
              <p className={styles.step3Description}>
                Elige entre diferentes tipos de broches, colores y acabados
              </p>
            </div>

            {/* Contenedor del viewer 3D */}
            <div
              className={styles.viewer3DWrapper}
              style={{
                transform: `translateY(${scrollProgress * -40}px) scale(${1 - scrollProgress * 0.15})`,
                opacity: 1 - scrollProgress * 0.2
              }}
            >
              <ProductViewer3D modelPath="/models/producto-compressed.glb" />

              {/* ✅ MEJORADO: Anotaciones con soporte táctil */}
              <div className={styles.annotationsContainer} ref={annotationsRef}>
                {annotations.map((annotation) => {
                  const isActive = activeAnnotationId === annotation.id

                  return (
                    <div
                      key={annotation.id}
                      className={`${styles.annotation} ${isActive ? styles.annotationActive : ''}`}
                      style={{
                        left: `${annotation.position.x}%`,
                        top: `${annotation.position.y}%`,
                      }}
                      data-annotation={annotation.id}
                    >
                      <button
                        type="button"
                        className={styles.annotationDot}
                        aria-label={annotation.label}
                        aria-expanded={isActive}
                        onPointerDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          toggleAnnotation(annotation.id)
                        }}
                      >
                        <span className={styles.annotationPulse} aria-hidden="true"></span>
                      </button>

                      {/* Tooltip */}
                      <div
                        className={styles.annotationTooltip}
                        role="tooltip"
                        aria-hidden={!isActive}
                        style={{
                          // Forzar display para debug
                          display: isActive ? 'block' : 'none'
                        }}
                      >
                        <h4>{annotation.label}</h4>
                        <p>{annotation.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Instrucciones de interacción */}
              <div className={styles.viewerHint}>
                <span>{isMobile ? '👆 Toca los puntos' : '🖱️ Arrastra para rotar'}</span>
              </div>
            </div>
          </div>

          {/* Step 3: Imagen de bolsa personalizada */}
          <div
            ref={step3Ref}
            className={`${styles.step3Container} ${isStep3Visible ? styles.visible : ''} ${isStep3Visible ? styles.parallaxVisible : ''}`}
          >
            {/* Título */}
            <div
              className={`${styles.stepTitleWrapper} ${styles.stepTitleWrapper2}`}
              style={{
                transform: `translateY(${scrollProgress * -100}px) scale(${1 + scrollProgress * 0.12})`,
                opacity: 1 - scrollProgress * 0.35
              }}
            >
              <Image
                src="/hero/titles/personalizalo.png"
                alt="Recíbelo en casa"
                width={1200}
                height={300}
                className={styles.stepTitleImage2}
                quality={75}
              />
            </div>

            <div
              className={styles.bagAnimationContainer}
              style={{
                transform: `translateY(${scrollProgress * -70}px) scale(${1 - scrollProgress * 0.1})`,
                opacity: 1 - scrollProgress * 0.25
              }}
            >
              <div className={`${styles.bagImage} ${isStep3Visible ? styles.bagAnimated : ''}`}>
                <Image
                  src="/hero/bolsa1.png"
                  alt="Bolsa de regalo Niñamar"
                  width={400}
                  height={500}
                  className={styles.bagImageElement}
                  priority
                />
              </div>

              <div className={styles.decorativeElements}>
                {decoItems.map((item, i) => (
                  <div key={i} className={item.cls} aria-hidden="true">
                    <Image
                      src={item.src}
                      alt=""
                      width={item.size}
                      height={item.size}
                      priority={false}
                    />
                  </div>
                ))}
              </div>

              {/* Confetti cuando aparece */}
              {isStep3Visible && (
                <div className={styles.confetti}>
                  {[...Array(25)].map((_, i) => (
                    <div
                      key={i}
                      className={styles.confettiPiece}
                      style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2.5}s`,
                        backgroundColor: ['#ffb3f9', '#ff8bf5', '#ffdb31', '#ffc0e8'][
                          Math.floor(Math.random() * 4)
                        ]
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div
              className={styles.step3Content}
              style={{
                transform: `translateY(${scrollProgress * -50}px)`,
                opacity: 1 - scrollProgress * 0.3
              }}
            >
              <p className={styles.step3Description}>
                En un par de días recíbelo en casa, disfrútalo y dale un toque de color y creatividad a tus outfits
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}