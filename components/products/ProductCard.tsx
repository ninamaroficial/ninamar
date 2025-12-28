"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import type { ProductWithDetails } from "@/lib/supabase/queries"
import { getProductCustomizations } from "@/lib/supabase/queries-client" // ← Cambiar aquí
import CustomizationModal from "./CustomizationModal"
import styles from "./ProductCard.module.css"

interface ProductCardProps {
  product: ProductWithDetails
  index?: number
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [customizationOptions, setCustomizationOptions] = useState<any[]>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)
  
  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0]
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
  
  // Cargar opciones de personalización si aún no las tenemos
  if (customizationOptions.length === 0) {
    setIsLoadingOptions(true)
    try {
      const options = await getProductCustomizations(product.id)
      console.log('Opciones cargadas:', options) // Para debugging
      setCustomizationOptions(options)
    } catch (error) {
      console.error('Error loading customization options:', error)
    } finally {
      setIsLoadingOptions(false)
    }
  }
  
  setIsModalOpen(true)
}
  return (
    <>
      <Link href={`/productos/${product.slug}`} className={styles.card}>
        <div className={styles.imageWrapper}>
          {primaryImage ? (
            <Image
              src={primaryImage.image_url}
              alt={primaryImage.alt_text || product.name}
              fill
              className={styles.image}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
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
            {product.original_price && (
              <span className={styles.originalPrice}>
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>

          <div className={styles.footer}>
            <div className={styles.rating}>
              <span className={styles.stars}>⭐⭐⭐⭐⭐</span>
            </div>
            
            <button 
              onClick={handleCustomizeClick}
              className={styles.customizeButton}
              disabled={isLoadingOptions || product.stock === 0}
            >
              <span className={styles.buttonSparkle}>
                {isLoadingOptions ? '⏳' : '✨'}
              </span>
              <span className={styles.buttonText}>
                {isLoadingOptions ? 'Cargando...' : 'Personalizar'}
              </span>
              {!isLoadingOptions && (
                <>
                  <span className={styles.buttonGlow}></span>
                  <span className={styles.buttonParticle}></span>
                  <span className={styles.buttonParticle}></span>
                  <span className={styles.buttonParticle}></span>
                </>
              )}
            </button>
          </div>
        </div>
      </Link>

      {/* Modal de personalización */}
      {isModalOpen && (
        <CustomizationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={product}
          options={customizationOptions}
        />
      )}
    </>
  )
}