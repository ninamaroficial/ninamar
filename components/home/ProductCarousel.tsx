"use client"

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './ProductCarousel.module.css'

// ✅ Interfaz actualizada con soporte móvil
interface CarouselImage {
  url: string
  urlMobile?: string // ← Nueva propiedad para imágenes móviles
  alt: string
  title?: string
}

interface ProductCarouselProps {
  images: CarouselImage[]
  autoPlayInterval?: number
}

export default function ProductCarousel({
  images,
  autoPlayInterval = 5000
}: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Detectar cliente y móvil
  useEffect(() => {
    setIsClient(true)
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile, { passive: true })

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const goToNext = useCallback(() => {
    if (isTransitioning) return
    setDirection('right')
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }, [images.length, isTransitioning])

  const goToPrevious = useCallback(() => {
    if (isTransitioning) return
    setDirection('left')
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length, isTransitioning])

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return
    setDirection(index > currentIndex ? 'right' : 'left')
    setIsTransitioning(true)
    setCurrentIndex(index)
  }

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(goToNext, autoPlayInterval)
    return () => clearInterval(interval)
  }, [isAutoPlaying, autoPlayInterval, goToNext])

  // Reset transition
  useEffect(() => {
    if (isTransitioning) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false)
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [isTransitioning])

  // ✅ Función para obtener la URL correcta según el dispositivo
  const getImageUrl = (image: CarouselImage) => {
    return isMobile && image.urlMobile ? image.urlMobile : image.url
  }


  return (
    <div 
      className={styles.carousel}
    >
      {/* Main Image Container */}
      <div className={styles.imageContainer}>
        {images.map((image, index) => (
          <div
            key={index}
            className={`${styles.imageWrapper} ${
              index === currentIndex ? styles.active : ''
            } ${isTransitioning ? styles.transitioning : ''}`}
            style={{
              transform: `translateX(${(index - currentIndex) * 100}%)`,
              opacity: index === currentIndex ? 1 : 0,
            }}
          >
            {/* ✅ Usar la URL correcta según el dispositivo */}
            <Image
              src={getImageUrl(image)}
              alt={image.alt}
              fill
              className={styles.image}
              sizes="100vw"
              quality={isMobile ? 70 : 75}
              priority={index === 0}
              fetchPriority={index === 0 ? "high" : "auto"}
              loading={index === 0 ? "eager" : "lazy"}
            />
            
            {/* Gradient overlay */}
            <div className={styles.imageOverlay}></div>
          </div>
        ))}
      </div>
      {/* Dots Indicator */}
      <div className={styles.dotsContainer}>
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`${styles.dot} ${
              index === currentIndex ? styles.dotActive : ''
            }`}
            aria-label={`Ir a imagen ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      {isAutoPlaying && (
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{
              animationDuration: `${autoPlayInterval}ms`,
            }}
          />
        </div>
      )}

      {/* Counter */}
      <div className={styles.counter}>
        <span className={styles.counterCurrent}>{currentIndex + 1}</span>
        <span className={styles.counterSeparator}>/</span>
        <span className={styles.counterTotal}>{images.length}</span>
      </div>

      {/* Thumbnail Preview (oculto en móvil) */}
      <div className={styles.thumbnailsContainer}>
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`${styles.thumbnail} ${
              index === currentIndex ? styles.thumbnailActive : ''
            }`}
          >
            {/* ✅ Usar la URL correcta para thumbnails también */}
            <Image
              src={getImageUrl(image)}
              alt={image.alt}
              fill
              className={styles.thumbnailImage}
              sizes="80px"
              quality={75}
            />
          </button>
        ))}
      </div>
    </div>
  )
}