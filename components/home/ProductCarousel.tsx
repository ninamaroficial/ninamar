"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './ProductCarousel.module.css'

interface CarouselImage {
  url: string
  alt: string
}

interface ProductCarouselProps {
  images: CarouselImage[]
  autoPlayInterval?: number
}

export default function ProductCarousel({ 
  images, 
  autoPlayInterval = 4000 
}: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // Auto-play
  useEffect(() => {
    if (!isHovered && images.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
      }, autoPlayInterval)

      return () => clearInterval(interval)
    }
  }, [currentIndex, images.length, autoPlayInterval, isHovered])

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <div 
      className={styles.carousel}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Image Display */}
      <div className={styles.imageContainer}>
        {/* Background blur effect */}
        <div className={styles.backgroundBlur}>
          <Image
            src={images[currentIndex].url}
            alt={images[currentIndex].alt}
            fill
            className={styles.blurImage}
            priority
          />
        </div>

        {/* Main image */}
        <div className={styles.mainImageWrapper}>
          <Image
            src={images[currentIndex].url}
            alt={images[currentIndex].alt}
            fill
            className={styles.mainImage}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={currentIndex === 0}
          />
        </div>

        {/* Floating decorations */}
        <div className={styles.floatingOrb1}></div>
        <div className={styles.floatingOrb2}></div>
        <div className={styles.floatingOrb3}></div>
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className={`${styles.navButton} ${styles.navButtonPrev}`}
            aria-label="Anterior"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={goToNext}
            className={`${styles.navButton} ${styles.navButtonNext}`}
            aria-label="Siguiente"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
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
      )}

      {/* Progress Bar */}
      {images.length > 1 && !isHovered && (
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{
              animation: `progress ${autoPlayInterval}ms linear`,
            }}
          />
        </div>
      )}
    </div>
  )
}