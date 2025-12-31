"use client"

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './ImageGalleryModal.module.css'

interface ImageGalleryModalProps {
  images: Array<{
    image_url: string
    alt_text?: string | null
  }>
  productName: string
  isOpen: boolean
  onClose: () => void
}

export default function ImageGalleryModal({ 
  images, 
  productName, 
  isOpen, 
  onClose 
}: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!isOpen) return null

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowLeft') handlePrevious()
    if (e.key === 'ArrowRight') handleNext()
  }

  return (
    <div 
      className={styles.overlay} 
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button onClick={onClose} className={styles.closeButton}>
          <X size={28} />
        </button>

        {/* Main Image */}
        <div className={styles.mainImageWrapper}>
          <Image
            src={images[currentIndex].image_url}
            alt={images[currentIndex].alt_text || productName}
            fill
            className={styles.mainImage}
            sizes="70vw"
            priority
          />

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button 
                onClick={handlePrevious} 
                className={`${styles.navButton} ${styles.prevButton}`}
                aria-label="Imagen anterior"
              >
                <ChevronLeft size={28} />
              </button>
              <button 
                onClick={handleNext} 
                className={`${styles.navButton} ${styles.nextButton}`}
                aria-label="Siguiente imagen"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className={styles.counter}>
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}