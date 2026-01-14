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

  // ✅ Nuevo: control de tooltip en móvil (tap)
  const [activeAnnotationId, setActiveAnnotationId] = useState<number | null>(null)
  const annotationsRef = useRef<HTMLDivElement | null>(null)

  const sectionRef = useRef<HTMLElement>(null)
  const step3Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.target === step3Ref.current) {
          setIsStep3Visible(entry.isIntersecting)
        }
      },
      { threshold: 0.3 }
    )

    if (step3Ref.current) observer.observe(step3Ref.current)

    return () => {
      if (step3Ref.current) observer.unobserve(step3Ref.current)
    }
  }, [])

  // ✅ Nuevo: cerrar tooltip al tocar fuera (móvil/desktop)
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!annotationsRef.current) return
      const target = e.target as Node
      if (!annotationsRef.current.contains(target)) {
        setActiveAnnotationId(null)
      }
    }

    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [])

  const toggleAnnotation = (id: number) => {
    setActiveAnnotationId(prev => (prev === id ? null : id))
  }

  return (
    <section ref={sectionRef} className={styles.howItWorks}>
      <Container>
        {/* Header Principal */}
        <div className={styles.mainHeader}>
          <div className={styles.titleImageWrapper}>
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
          <div className={styles.step3DContainer}>
            {/* Título Script Grande */}
            <div className={styles.stepTitleWrapper}>
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
            <div className={styles.step3Content}>
              <p className={styles.step3Description}>
                Elige entre diferentes tipos de broches, colores y acabados
              </p>
            </div>

            {/* Contenedor del viewer 3D */}
            <div className={styles.viewer3DWrapper}>
              <ProductViewer3D modelPath="/models/producto-optimized.glb" />

              {/* ✅ Anotaciones sobre el modelo (actualizado) */}
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
                    >
                      {/* ✅ Punto interactivo ahora es botón (tap-friendly) */}
                      <button
                        type="button"
                        className={styles.annotationDot}
                        aria-label={annotation.label}
                        aria-expanded={isActive}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleAnnotation(annotation.id)
                        }}
                      >
                        <span className={styles.annotationPulse} aria-hidden="true"></span>
                      </button>

                      {/* Tooltip */}
                      <div className={styles.annotationTooltip} role="tooltip">
                        <h4>{annotation.label}</h4>
                        <p>{annotation.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Instrucciones de interacción */}
              <div className={styles.viewerHint}>
                <span>🖱️ Arrastra para rotar</span>
              </div>
            </div>
          </div>

          {/* Step 3: Imagen de bolsa personalizada */}
          <div
            ref={step3Ref}
            className={`${styles.step3Container} ${isStep3Visible ? styles.visible : ''}`}
          >
            {/* Título */}
            <div className={`${styles.stepTitleWrapper} ${styles.stepTitleWrapper2}`}>
              <Image
                src="/hero/titles/personalizalo.png"
                alt="Recíbelo en casa"
                width={1200}
                height={300}
                className={styles.stepTitleImage2}
                quality={75}
              />
            </div>

            <div className={styles.bagAnimationContainer}>
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

            <div className={styles.step3Content}>
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
