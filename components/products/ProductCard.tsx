"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import type { ProductWithDetails } from "@/lib/supabase/queries"
import ImageGalleryModal from "./ImageGalleryModal"
import styles from "./ProductCard.module.css"

interface ProductCardProps {
  product: ProductWithDetails
  index?: number
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Obtener imágenes del producto
  const images = product.images && product.images.length > 0 
    ? product.images 
    : product.image_url 
      ? [{ image_url: product.image_url, alt_text: product.name, is_primary: true }]
      : []

  const primaryImage = images.find(img => img.is_primary) || images[0]
  
  // ✅ Calcular descuento solo si hay diferencia real de precio
  const hasDiscount = product.original_price != null && product.original_price > product.price
  const discount = hasDiscount && product.original_price != null
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Solo abrir modal en desktop
    if (!isMobile && images.length > 0) {
      setIsGalleryOpen(true)
    }
  }

  // Cambiar imagen en hover (solo desktop)
  const handleMouseEnter = () => {
    if (!isMobile && images.length > 1) {
      setCurrentImageIndex(1)
    }
  }

  const handleMouseLeave = () => {
    if (!isMobile) {
      setCurrentImageIndex(0)
    }
  }

  const currentImage = images[currentImageIndex] || primaryImage

  return (
    <>
      <article className={styles.card}>
        {/* VERSIÓN MÓVIL: Carrusel con scroll */}
        {isMobile ? (
          <div className={styles.imageCarousel}>
            <div className={styles.imagesWrapper} ref={scrollRef}>
              {images.length > 0 ? (
                images.map((image, idx) => (
                  <div key={idx} className={styles.imageSlide}>
                    <Image
                      src={image.image_url}
                      alt={image.alt_text || product.name}
                      fill
                      className={styles.image}
                      sizes="(max-width: 768px) 95vw, 400px"
                      priority={index < 2 && idx === 0}
                      loading={index < 2 && idx === 0 ? "eager" : "lazy"}
                      quality={75}
                      placeholder="blur"
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                    />
                  </div>
                ))
              ) : (
                <div className={styles.imagePlaceholder}>
                  <span className={styles.placeholderIcon}>�</span>
                  <span className={styles.placeholderText}>Cargando...</span>
                </div>
              )}
            </div>

            {/* Indicadores de scroll */}
            {images.length > 1 && (
              <div className={styles.scrollIndicators}>
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    className={styles.indicator}
                    onClick={() => {
                      if (scrollRef.current) {
                        scrollRef.current.scrollTo({
                          left: scrollRef.current.offsetWidth * idx,
                          behavior: 'smooth'
                        })
                      }
                    }}
                    aria-label={`Ver imagen ${idx + 1}`}
                  />
                ))}
              </div>
            )}
            
            {/* Badge de descuento */}
            {hasDiscount && discount > 0 && (
              <div className={styles.badge}>
                -{discount}%
              </div>
            )}

            {product.stock === 0 && (
              <div className={styles.outOfStock}>
                Agotado
              </div>
            )}
          </div>
        ) : (
          /* VERSIÓN DESKTOP: Imagen con hover y modal */
          <div 
            className={styles.imageWrapper}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleImageClick}
          >
            {currentImage ? (
              <Image
                src={currentImage.image_url}
                alt={currentImage.alt_text || product.name}
                fill
                className={styles.image}
                sizes="(max-width: 768px) 95vw, (max-width: 1200px) 50vw, 400px"
                priority={index < 3}
                loading={index < 3 ? "eager" : "lazy"}
                quality={80}
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
              />
            ) : (
              <div className={styles.imagePlaceholder}>
                <span className={styles.placeholderIcon}>�</span>
                <span className={styles.placeholderText}>Cargando...</span>
              </div>
            )}
            
            {/* Badge de descuento */}
            {hasDiscount && discount > 0 && (
              <div className={styles.badge}>
                -{discount}%
              </div>
            )}

            {product.stock === 0 && (
              <div className={styles.outOfStock}>
                Agotado
              </div>
            )}
          </div>
        )}

        {/* Contenido */}
        <div className={styles.content}>
          {product.category && (
            <p className={styles.category}>{product.category.name}</p>
          )}
          
          <h3 className={styles.title}>{product.name}</h3>
          
          {product.short_description && (
            <p className={styles.description}>{product.short_description}</p>
          )}

          <div className={styles.priceWrapper}>
            <span className={styles.price}>{formatPrice(product.price)}</span>
            {hasDiscount && product.original_price != null && (
              <span className={styles.originalPrice}>
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
        </div>

        {/* Footer con botón */}
        <div className={styles.footer}>
          <Link
            href={`/productos/${product.slug}/personalizar`}
            className={styles.customizeButton}
            aria-disabled={product.stock === 0}
            onClick={(e) => {
              if (product.stock === 0) {
                e.preventDefault()
              }
            }}
          >
            Comprar
          </Link>
        </div>
      </article>

      {/* Modal de galería (solo desktop) */}
      {!isMobile && isGalleryOpen && (
        <ImageGalleryModal
          images={images}
          productName={product.name}
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
        />
      )}
    </>
  )
}