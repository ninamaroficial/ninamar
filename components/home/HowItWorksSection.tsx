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

    if (step3Ref.current) {
      observer.observe(step3Ref.current)
    }

    return () => {
      if (step3Ref.current) {
        observer.unobserve(step3Ref.current)
      }
    }
  }, [])

  return (
    <section ref={sectionRef} className={styles.howItWorks}>
      <Container>
        {/* Header Principal */}
        <div className={styles.mainHeader}>
          <h2 className={styles.mainTitle}>¿Cómo Funciona?</h2>
        </div>

        {/* Step 1 y 2: Viewer 3D con anotaciones */}
        <div className={styles.stepsContainer}>
          <div className={styles.step3DContainer}>
            {/* Título Script Grande */}
            <h3 className={styles.stepScriptTitle}>
              Elige tu producto y personalízalo
            </h3>

            {/* Contenedor del viewer 3D */}
            <div className={styles.viewer3DWrapper}>
              <ProductViewer3D modelPath="/models/producto-optimized.glb" />
              
              {/* Anotaciones sobre el modelo */}
              <div className={styles.annotationsContainer}>
                {annotations.map((annotation) => (
                  <div
                    key={annotation.id}
                    className={styles.annotation}
                    style={{
                      left: `${annotation.position.x}%`,
                      top: `${annotation.position.y}%`,
                    }}
                  >
                    {/* Punto interactivo */}
                    <div className={styles.annotationDot}>
                      <div className={styles.annotationPulse}></div>
                    </div>

                    {/* Tooltip */}
                    <div className={styles.annotationTooltip}>
                      <h4>{annotation.label}</h4>
                      <p>{annotation.description}</p>
                    </div>
                  </div>
                ))}
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
            {/* Título Script Grande */}
            <h3 className={styles.stepScriptTitle}>
              Recíbelo en casa
            </h3>

            <div className={styles.bagAnimationContainer}>
              {/* Tu imagen de la bolsa */}
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

              {/* Elementos decorativos */}
              <div className={styles.decorativeElements}>
                <div className={`${styles.sparkle} ${styles.sparkle1}`}>✨</div>
                <div className={`${styles.sparkle} ${styles.sparkle2}`}>💫</div>
                <div className={`${styles.sparkle} ${styles.sparkle3}`}>⭐</div>
                <div className={`${styles.sparkle} ${styles.sparkle4}`}>✨</div>
                <div className={`${styles.sparkle} ${styles.sparkle5}`}>💖</div>
                <div className={`${styles.sparkle} ${styles.sparkle6}`}>🎀</div>
                
                {/* Corazones flotantes */}
                <div className={`${styles.heart} ${styles.heart1}`}>💕</div>
                <div className={`${styles.heart} ${styles.heart2}`}>💗</div>
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
                        backgroundColor: ['#ffb3f9', '#ff8bf5', '#ffdb31', '#ffc0e8'][Math.floor(Math.random() * 4)]
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Texto descriptivo */}
            <div className={styles.step3Content}>
              <p className={styles.step3Description}>
                Tu accesorio personalizado llega en una hermosa bolsa de regalo, 
                listo para usar o regalar. Sin costo adicional.
              </p>
              <div className={styles.shippingBenefits}>
                <div className={styles.benefit}>
                  <span className={styles.benefitIcon}>⏱️</span>
                  <span>5-7 días hábiles</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}