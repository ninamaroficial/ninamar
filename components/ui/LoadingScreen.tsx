"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import styles from './LoadingScreen.module.css'

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true)
  const [particles, setParticles] = useState<Array<{
    left: string
    top: string
    delay: string
    duration: string
  }>>([])

  useEffect(() => {
    // Generar partículas solo en el cliente
    const generatedParticles = [...Array(20)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 3}s`,
      duration: `${3 + Math.random() * 4}s`
    }))
    setParticles(generatedParticles)

    // Simular carga mínima
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (!isLoading) return null

  return (
    <div className={styles.loadingScreen}>
      <div className={styles.content}>
        {/* Logo 3D */}
        <div className={styles.logoContainer}>
          <div className={styles.logo3d}>
            <div className={styles.logoFace}>
              {/* Opción 1: Con tu logo (descomenta cuando tengas el logo) */}
              <Image
                src="/images/logo2.png"
                alt="Niñamar"
                width={120}
                height={120}
                className={styles.logoImage}
              />
              
            </div>
          </div>
          
          {/* Círculo giratorio */}
          <svg className={styles.circle} viewBox="0 0 100 100">
            <defs>
              <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a6e8e4" />
                <stop offset="50%" stopColor="#8dd4cf" />
                <stop offset="100%" stopColor="#6ec1bc" />
              </linearGradient>
            </defs>
            <circle
              className={styles.circlePath}
              cx="50"
              cy="50"
              r="45"
              fill="none"
              strokeWidth="4"
            />
          </svg>
        </div>

        {/* Texto */}
        <div className={styles.textContainer}>
          <h2 className={styles.title}>Niñamar</h2>
          <p className={styles.subtitle}>Estamos cargando la información para ti</p>
          
          {/* Puntos animados */}
          <div className={styles.dots}>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className={styles.progressBar}>
          <div className={styles.progress}></div>
        </div>
      </div>

      {/* Partículas de fondo - solo después de montar en el cliente */}
      {particles.length > 0 && (
        <div className={styles.particles}>
          {particles.map((particle, i) => (
            <div 
              key={i} 
              className={styles.particle} 
              style={{
                left: particle.left,
                top: particle.top,
                animationDelay: particle.delay,
                animationDuration: particle.duration
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}