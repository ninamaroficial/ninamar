"use client"

import { useState, useEffect } from "react"
import { X, Plus, Minus, ShoppingCart, Sparkles, ChevronRight, Check, ZoomIn, ChevronLeft } from "lucide-react"
import Image from "next/image"
import type { ProductWithDetails } from "@/lib/supabase/queries"
import styles from "./CustomizationModal.module.css"
import { useCart } from "@/lib/context/CartContext"

interface CustomizationOption {
  id: string
  name: string
  type: string
  values: {
    id: string
    value: string
    additional_price: number
    hex_color?: string | null
    image_url?: string | null
  }[]
  is_required: boolean
}

interface CustomizationModalProps {
  isOpen: boolean
  onClose: () => void
  product: ProductWithDetails
  options: CustomizationOption[]
}

export default function CustomizationModal({
  isOpen,
  onClose,
  product,
  options
}: CustomizationModalProps) {
  const { addItem } = useCart()
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const [currentStep, setCurrentStep] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isImageZoomed, setIsImageZoomed] = useState(false)

  const totalSteps = options.length + 1

  // Obtener todas las imágenes
  const images = product.images && product.images.length > 0 
    ? product.images 
    : product.image_url 
      ? [{ image_url: product.image_url, alt_text: product.name, is_primary: true }]
      : []

useEffect(() => {
  if (!isOpen) return

  const scrollY = window.scrollY
  const body = document.body

  // Lock real iOS: fija el body para que no “ruede” atrás
  body.style.position = "fixed"
  body.style.top = `-${scrollY}px`
  body.style.left = "0"
  body.style.right = "0"
  body.style.width = "100%"

  return () => {
    // Restore
    const top = body.style.top
    body.style.position = ""
    body.style.top = ""
    body.style.left = ""
    body.style.right = ""
    body.style.width = ""

    const y = top ? Math.abs(parseInt(top, 10)) : 0
    window.scrollTo(0, y)
  }
}, [isOpen])


  const calculateTotalPrice = () => {
    let total = product.price
    Object.entries(selectedOptions).forEach(([optionId, valueId]) => {
      const option = options.find(opt => opt.id === optionId)
      const value = option?.values.find(val => val.id === valueId)
      if (value) {
        total += value.additional_price
      }
    })
    return total * quantity
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handleOptionSelect = (optionId: string, valueId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: valueId
    }))
  }

  const handleAddToCart = () => {
    const requiredOptions = options.filter(opt => opt.is_required)
    const missingRequired = requiredOptions.some(opt => !selectedOptions[opt.id])
    
    if (missingRequired) {
      alert('Por favor selecciona todas las opciones requeridas')
      return
    }

    const primaryImage = images[0]

    const selectedOptionsDetails = Object.entries(selectedOptions).map(([optionId, valueId]) => {
      const option = options.find(opt => opt.id === optionId)
      const value = option?.values.find(v => v.id === valueId)
      
      return {
        optionId: optionId,
        optionName: option?.name || '',
        valueId: valueId,
        valueName: value?.value || '',
        additionalPrice: value?.additional_price || 0
      }
    })

    const cartItem = {
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: primaryImage?.image_url || '',
      basePrice: product.price,
      selectedOptions: selectedOptionsDetails,
      quantity: quantity,
      totalPrice: calculateTotalPrice()
    }

    addItem(cartItem)
    onClose()
  }

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const currentOption = options[currentStep]
  const isLastStep = currentStep === options.length
  const canContinue = !currentOption?.is_required || selectedOptions[currentOption?.id]

  if (!isOpen) return null

  const currentImage = images[currentImageIndex]

  return (
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          {/* Header con botón cerrar */}
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>

          {/* Layout de 2 columnas en desktop, completo en móvil */}
          <div className={styles.modalContent}>
            {/* SIDEBAR IZQUIERDO - Vista del producto FIJA */}
            <div className={styles.productSidebar}>
              {/* Galería de imágenes con carrusel */}
              <div className={styles.productGallery}>
                <div className={styles.mainImageContainer}>
                  {currentImage ? (
                    <>
                      <Image
                        src={currentImage.image_url}
                        alt={currentImage.alt_text || product.name}
                        fill
                        className={styles.productImage}
                        sizes="(max-width: 768px) 100vw, 40vw"
                      />
                      
                      {/* Botón de zoom */}
                      <button 
                        className={styles.zoomButton}
                        onClick={() => setIsImageZoomed(true)}
                      >
                        <ZoomIn size={20} />
                      </button>

                      {/* Navegación de imágenes */}
                      {images.length > 1 && (
                        <>
                          <button 
                            className={`${styles.imageNavButton} ${styles.prevImageButton}`}
                            onClick={handlePreviousImage}
                          >
                            <ChevronLeft size={24} />
                          </button>
                          <button 
                            className={`${styles.imageNavButton} ${styles.nextImageButton}`}
                            onClick={handleNextImage}
                          >
                            <ChevronRight size={24} />
                          </button>

                          {/* Contador de imágenes */}
                          <div className={styles.imageCounter}>
                            {currentImageIndex + 1} / {images.length}
                          </div>
                        </>
                      )}

                      <div className={styles.imageOverlay}>
                        <Sparkles className={styles.sparkleIcon} />
                      </div>
                    </>
                  ) : (
                    <div className={styles.imagePlaceholder}>💎</div>
                  )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className={styles.thumbnailsContainer}>
                    {images.map((image, idx) => (
                      <button
                        key={idx}
                        className={`${styles.thumbnail} ${idx === currentImageIndex ? styles.thumbnailActive : ''}`}
                        onClick={() => setCurrentImageIndex(idx)}
                      >
                        <Image
                          src={image.image_url}
                          alt={image.alt_text || `${product.name} ${idx + 1}`}
                          fill
                          className={styles.thumbnailImage}
                          sizes="100px"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Resumen de personalización - SIEMPRE VISIBLE */}
              <div className={styles.customizationSummary}>
                <h3 className={styles.summaryTitle}>Tu Personalización</h3>
                
                <div className={styles.summaryList}>
                  {options.map(option => {
                    const valueId = selectedOptions[option.id]
                    const value = option.values.find(v => v.id === valueId)
                    
                    return (
                      <div key={option.id} className={styles.summaryItem}>
                        <div className={styles.summaryHeader}>
                          <span className={styles.summaryLabel}>{option.name}</span>
                          {value ? (
                            <Check size={16} className={styles.checkIcon} />
                          ) : (
                            option.is_required && <span className={styles.requiredDot}>*</span>
                          )}
                        </div>
                        {value ? (
                          <div className={styles.summaryValue}>
                            {value.hex_color && (
                              <div 
                                className={styles.summaryColorDot}
                                style={{ backgroundColor: value.hex_color }}
                              />
                            )}
                            <span>{value.value}</span>
                            {value.additional_price > 0 && (
                              <span className={styles.summaryPrice}>
                                +{formatPrice(value.additional_price)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className={styles.summaryEmpty}>Sin seleccionar</span>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Total */}
                <div className={styles.summaryTotal}>
                  <span className={styles.totalLabel}>Total</span>
                  <span className={styles.totalPrice}>{formatPrice(calculateTotalPrice())}</span>
                </div>
              </div>
            </div>

            {/* PANEL DERECHO - Opciones scrolleables */}
            <div className={styles.optionsPanel}>

              {/* GALERÍA SOLO MÓVIL */}
{currentImage && (
  <div className={styles.mobileGallery}>
    <div className={styles.mobileMainImage}>
      <Image
        src={currentImage.image_url}
        alt={currentImage.alt_text || product.name}
        fill
        className={styles.productImage}
        sizes="100vw"
        priority
      />

      <button
        className={styles.zoomButton}
        onClick={() => setIsImageZoomed(true)}
        aria-label="Zoom"
      >
        <ZoomIn size={20} />
      </button>

      {images.length > 1 && (
        <>
          <button
            className={`${styles.imageNavButton} ${styles.prevImageButton}`}
            onClick={handlePreviousImage}
            aria-label="Imagen anterior"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            className={`${styles.imageNavButton} ${styles.nextImageButton}`}
            onClick={handleNextImage}
            aria-label="Siguiente imagen"
          >
            <ChevronRight size={24} />
          </button>

          <div className={styles.imageCounter}>
            {currentImageIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>

    {/* thumbnails móvil */}
    {images.length > 1 && (
      <div className={styles.mobileThumbs}>
        {images.map((image, idx) => (
          <button
            key={idx}
            className={`${styles.thumbnail} ${idx === currentImageIndex ? styles.thumbnailActive : ''}`}
            onClick={() => setCurrentImageIndex(idx)}
            aria-label={`Ver imagen ${idx + 1}`}
          >
            <Image
              src={image.image_url}
              alt={image.alt_text || `${product.name} ${idx + 1}`}
              fill
              className={styles.thumbnailImage}
              sizes="80px"
            />
          </button>
        ))}
      </div>
    )}
  </div>
)}

              {/* Progress bar */}
              <div className={styles.progressSection}>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                  />
                </div>
                <p className={styles.progressText}>
                  Paso {currentStep + 1} de {totalSteps}
                </p>
              </div>

              {/* Contenido scrolleable */}
              <div className={`${styles.optionsContent} ${isLastStep ? styles.optionsContentFinal : ""}`}>
                {!isLastStep && currentOption ? (
                  <div className={styles.optionSection}>
                    <div className={styles.optionHeader}>
                      <h2 className={styles.optionTitle}>
                        {currentOption.name}
                        {currentOption.is_required && (
                          <span className={styles.required}>*</span>
                        )}
                      </h2>
                      <p className={styles.optionDescription}>
                        Selecciona una opción para continuar
                      </p>
                    </div>

                    <div className={styles.optionGrid}>
                      {currentOption.values.map((value) => {
                        const isSelected = selectedOptions[currentOption.id] === value.id
                        
                        return (
                          <button
                            key={value.id}
                            onClick={() => handleOptionSelect(currentOption.id, value.id)}
                            className={`${styles.optionCard} ${isSelected ? styles.optionCardActive : ''}`}
                          >
                            {value.hex_color && (
                              <div 
                                className={styles.colorPreview}
                                style={{ backgroundColor: value.hex_color }}
                              />
                            )}
                            
                            <div className={styles.optionInfo}>
                              <span className={styles.optionValue}>{value.value}</span>
                              {value.additional_price > 0 && (
                                <span className={styles.optionPrice}>
                                  +{formatPrice(value.additional_price)}
                                </span>
                              )}
                            </div>

                            {isSelected && (
                              <div className={styles.selectedBadge}>
                                <Check size={18} />
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  /* Paso final - Cantidad */
                  <div className={styles.finalStep}>
                    <div className={styles.optionHeader}>
                      <h2 className={styles.optionTitle}>Cantidad</h2>
                      <p className={styles.optionDescription}>
                        ¿Cuántas unidades deseas?
                      </p>
                    </div>

                    <div className={styles.quantitySelector}>
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className={styles.quantityButton}
                        disabled={quantity <= 1}
                      >
                        <Minus size={24} />
                      </button>
                      
                      <div className={styles.quantityDisplay}>
                        <span className={styles.quantityValue}>{quantity}</span>
                        <span className={styles.quantityLabel}>unidades</span>
                      </div>
                      
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className={styles.quantityButton}
                        disabled={quantity >= product.stock}
                      >
                        <Plus size={24} />
                      </button>
                    </div>

                    <p className={styles.stockInfo}>
                      Stock disponible: <strong>{product.stock}</strong> unidades
                    </p>
                  </div>
                )}
              </div>

              {/* Footer con botones */}
              <div className={styles.footer}>
                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className={styles.backButton}
                  >
                    Atrás
                  </button>
                )}
                
                {!isLastStep ? (
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={!canContinue}
                    className={styles.continueButton}
                  >
                    Continuar
                    <ChevronRight size={20} />
                  </button>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    className={styles.addToCartButton}
                  >
                    <ShoppingCart size={20} />
                    Agregar al Carrito
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Zoom de Imagen */}
      {isImageZoomed && currentImage && (
        <div className={styles.zoomOverlay} onClick={() => setIsImageZoomed(false)}>
          <button 
            className={styles.zoomCloseButton}
            onClick={() => setIsImageZoomed(false)}
          >
            <X size={28} />
          </button>

          <div className={styles.zoomContent} onClick={(e) => e.stopPropagation()}>
            <Image
              src={currentImage.image_url}
              alt={currentImage.alt_text || product.name}
              fill
              className={styles.zoomedImage}
              sizes="90vw"
              priority
            />

            {/* Navegación en zoom */}
            {images.length > 1 && (
              <>
                <button 
                  className={`${styles.zoomNavButton} ${styles.zoomPrevButton}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePreviousImage()
                  }}
                >
                  <ChevronLeft size={32} />
                </button>
                <button 
                  className={`${styles.zoomNavButton} ${styles.zoomNextButton}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNextImage()
                  }}
                >
                  <ChevronRight size={32} />
                </button>

                <div className={styles.zoomCounter}>
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}