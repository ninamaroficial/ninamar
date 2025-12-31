"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import type { ProductWithDetails } from "@/lib/supabase/queries"
import { getProductCustomizations } from "@/lib/supabase/queries-client"
import CustomizationModal from "./CustomizationModal"
import ImageGalleryModal from "./ImageGalleryModal"
import styles from "./ProductCard.module.css"

interface ProductCardProps {
  product: ProductWithDetails
  index?: number
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [customizationOptions, setCustomizationOptions] = useState<any[]>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  // Obtener imágenes del producto
  const images = product.images && product.images.length > 0 
    ? product.images 
    : product.image_url 
      ? [{ image_url: product.image_url, alt_text: product.name, is_primary: true }]
      : []

  const primaryImage = images.find(img => img.is_primary) || images[0]
  
  const discount = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handleCustomizeClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (customizationOptions.length === 0) {
      setIsLoadingOptions(true)
      try {
        const options = await getProductCustomizations(product.id)
        setCustomizationOptions(options)
      } catch (error) {
        console.error('Error loading customization options:', error)
      } finally {
        setIsLoadingOptions(false)
      }
    }
    
    setIsModalOpen(true)
  }

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (images.length > 0) {
      setIsGalleryOpen(true)
    }
  }

  // Cambiar imagen en hover (solo si hay múltiples imágenes)
  const handleMouseEnter = () => {
    if (images.length > 1) {
      setCurrentImageIndex(1)
    }
  }

  const handleMouseLeave = () => {
    setCurrentImageIndex(0)
  }

  const currentImage = images[currentImageIndex] || primaryImage

  return (
    <>
      <article className={styles.card}>
        {/* Imagen con hover y click para galería */}
        <div 
          className={styles.imageWrapper}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleImageClick}
        >
          {currentImage ? (
            <>
              <Image
                src={currentImage.image_url}
                alt={currentImage.alt_text || product.name}
                fill
                className={styles.image}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={index < 6}
              />
            </>
          ) : (
            <div className={styles.imagePlaceholder}>
              <span className={styles.placeholderIcon}>💎</span>
            </div>
          )}
          
          {discount > 0 && (
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

        {/* Contenido */}
        <Link href={`/productos/${product.slug}`} className={styles.content}>
          {product.category && (
            <p className={styles.category}>{product.category.name}</p>
          )}
          
          <h3 className={styles.title}>{product.name}</h3>
          
          {product.short_description && (
            <p className={styles.description}>{product.short_description}</p>
          )}

          <div className={styles.priceWrapper}>
            <span className={styles.price}>{formatPrice(product.price)}</span>
            {product.original_price && (
              <span className={styles.originalPrice}>
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
        </Link>

        {/* Footer con botón */}
        <div className={styles.footer}>
          <button 
            onClick={handleCustomizeClick}
            className={styles.customizeButton}
            disabled={isLoadingOptions || product.stock === 0}
          >
            {isLoadingOptions ? 'Cargando...' : 'Personalizar'}
          </button>
        </div>
      </article>

      {/* Modal de personalización */}
      {isModalOpen && (
        <CustomizationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={product}
          options={customizationOptions}
        />
      )}

      {/* Modal de galería */}
      {isGalleryOpen && (
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