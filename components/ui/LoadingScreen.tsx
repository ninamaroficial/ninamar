"use client"

import { useEffect, useState } from 'react'
import styles from './LoadingScreen.module.css'
import Image from 'next/image'

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
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
              <Image
                src="/images/logo.png"
                alt="Niña Mar"
                width={80}
                height={80}
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
          <h2 className={styles.title}>Niña Mar</h2>
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

      {/* Partículas de fondo */}
      <div className={styles.particles}>
        {[...Array(20)].map((_, i) => (
          <div key={i} className={styles.particle} style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }}></div>
        ))}
      </div>
    </div>
  )
}