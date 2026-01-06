"use client"

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './ProductCarousel.module.css'

// ✅ Actualizar la interfaz
interface CarouselImage {
  url: string
  alt: string
}

interface ProductCarouselProps {
  images: CarouselImage[] // ← Cambiar de string[] a CarouselImage[]
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

  const handleMouseEnter = () => setIsAutoPlaying(false)
  const handleMouseLeave = () => setIsAutoPlaying(true)

  return (
    <div 
      className={styles.carousel}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
<Image
  src={image.url}
  alt={image.alt}
  fill
  className={styles.image}
  sizes="100vw"
  quality={100}
  priority={index === 0}
  unoptimized={true} // ← Desactivar optimización de Next.js
/>
            
            {/* Gradient overlay */}
            <div className={styles.imageOverlay}></div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className={`${styles.navButton} ${styles.navButtonLeft}`}
        aria-label="Anterior"
        disabled={isTransitioning}
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={goToNext}
        className={`${styles.navButton} ${styles.navButtonRight}`}
        aria-label="Siguiente"
        disabled={isTransitioning}
      >
        <ChevronRight size={24} />
      </button>

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

      {/* Thumbnail Preview */}
      <div className={styles.thumbnailsContainer}>
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`${styles.thumbnail} ${
              index === currentIndex ? styles.thumbnailActive : ''
            }`}
          >
<Image
  src={image.url}
  alt={image.alt}
  fill
  className={styles.thumbnailImage}
  sizes="80px"
  quality={90} // ← Agregar calidad
/>
          </button>
        ))}
      </div>
    </div>
  )
}