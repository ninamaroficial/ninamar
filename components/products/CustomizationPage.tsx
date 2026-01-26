"use client"

import { useState } from "react"
import { X, Plus, Minus, ShoppingCart, ChevronRight, Check, ChevronLeft, ArrowLeft } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import type { ProductWithDetails } from "@/lib/supabase/queries"
import styles from "./CustomizationPage.module.css"
import { useCart } from "@/lib/context/CartContext"
import Container from "@/components/ui/Container"

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

interface CustomizationPageProps {
  product: ProductWithDetails
  options: CustomizationOption[]
}

export default function CustomizationPage({
  product,
  options
}: CustomizationPageProps) {
  const router = useRouter()
  const { addItem } = useCart()
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const [currentStep, setCurrentStep] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false) // ✅ Nuevo estado

  const totalSteps = options.length + 1

  // Obtener todas las imágenes
  const images = product.images && product.images.length > 0
    ? product.images
    : product.image_url
      ? [{ image_url: product.image_url, alt_text: product.name, is_primary: true }]
      : []

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
    router.push('/checkout')
  }

  const currentOption = options[currentStep]
  const isLastStep = currentStep === totalSteps - 1
  const canContinue = !currentOption?.is_required || selectedOptions[currentOption?.id]

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleOpenFullImage = () => {
    if (images.length === 0) return
    window.open(images[currentImageIndex].image_url, "_blank")
  }

  return (
    <div className={styles.page}>
      <Container className={styles.container}>
        {/* Header con botón de regresar */}
        <div className={styles.header}>
          <button
            onClick={() => router.back()}
            className={styles.backLink}
          >
            <ArrowLeft size={20} />
            <span>Volver</span>
          </button>
          <div className={styles.pageTitleSpacer} aria-hidden="true" />
        </div>

        <div className={styles.content}>
          {/* Columna izquierda: Galería de imágenes */}
          <aside className={styles.sidebar}>
            <div className={styles.gallery}>
              <div className={styles.mainImageContainer}>
                {images.length > 0 ? (
                  <>
                    <Image
                      src={images[currentImageIndex].image_url}
                      alt={images[currentImageIndex].alt_text || product.name}
                      fill
                      className={styles.mainImage}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                      onClick={handleOpenFullImage}
                    />

                    {images.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className={`${styles.imageNavButton} ${styles.prevButton}`}
                          aria-label="Imagen anterior"
                        >
                          <ChevronLeft size={24} />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className={`${styles.imageNavButton} ${styles.nextButton}`}
                          aria-label="Siguiente imagen"
                        >
                          <ChevronRight size={24} />
                        </button>

                        <div className={styles.imageCounter}>
                          {currentImageIndex + 1} / {images.length}
                        </div>
                      </>
                    )}

                    <div className={styles.imageHint}>Toca o haz clic para ver grande</div>
                  </>
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <span>💎</span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className={styles.thumbnails}>
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`${styles.thumbnail} ${
                        index === currentImageIndex ? styles.thumbnailActive : ''
                      }`}
                    >
                      <Image
                        src={image.image_url}
                        alt={image.alt_text || `${product.name} - Imagen ${index + 1}`}
                        fill
                        className={styles.thumbnailImage}
                        sizes="100px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>
{/* Columna central: Opciones */}
<div className={styles.mainContent}>
  {/* Progress bar */}
  <div className={styles.progress}>
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

  {/* Contenido del paso actual */}
  <div className={styles.stepContent}>
    {currentStep < options.length ? (
      // Paso de selección de opción
      <div className={styles.optionSection}>
        <div className={styles.optionHeader}>
          <h2 className={styles.optionTitle}>
            {currentOption.name}
            {currentOption.is_required && (
              <span className={styles.required}>*</span>
            )}
          </h2>
          {currentOption.is_required && (
            <p className={styles.optionDescription}>
              Este campo es obligatorio
            </p>
          )}
        </div>

        <div className={styles.optionGrid}>
          {currentOption.values.map((value) => {
            const isSelected = selectedOptions[currentOption.id] === value.id

            return (
              <button
                key={value.id}
                onClick={() => handleOptionSelect(currentOption.id, value.id)}
                className={`${styles.optionCard} ${
                  isSelected ? styles.optionCardActive : ''
                }`}
              >
                {value.hex_color && (
                  <span
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
                    <Check size={16} />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    ) : (
      // Paso final: Cantidad
      <div className={styles.finalStep}>
        <div className={styles.optionHeader}>
          <h2 className={styles.optionTitle}>¿Cuántos quieres?</h2>
          <p className={styles.optionDescription}>
            Selecciona la cantidad que deseas
          </p>
        </div>

        <div className={styles.quantitySelector}>
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className={styles.quantityButton}
            disabled={quantity <= 1}
            aria-label="Reducir cantidad"
          >
            <Minus size={20} />
          </button>

          <div className={styles.quantityDisplay}>
            <span className={styles.quantityValue}>{quantity}</span>
            <span className={styles.quantityLabel}>
              {quantity === 1 ? 'unidad' : 'unidades'}
            </span>
          </div>

          <button
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            className={styles.quantityButton}
            disabled={quantity >= product.stock}
            aria-label="Aumentar cantidad"
          >
            <Plus size={20} />
          </button>
        </div>

        {product.stock > 0 && (
          <p className={styles.stockInfo}>
            <strong>{product.stock}</strong> unidades disponibles
          </p>
        )}
      </div>
    )}
  </div>

  {/* Navegación */}
  <div className={styles.navigation}>
    {currentStep > 0 && (
      <button
        onClick={() => setCurrentStep(currentStep - 1)}
        className={styles.navButton}
      >
        <ChevronLeft size={20} />
        Anterior
      </button>
    )}

    {!isLastStep ? (
      <button
        onClick={() => setCurrentStep(currentStep + 1)}
        className={styles.navButtonPrimary}
        disabled={!canContinue}
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
        Agregar al carrito
      </button>
    )}
  </div>
</div>

          {/* Columna derecha: Resumen de personalización */}
          <aside className={styles.summaryColumn}>
            <div className={styles.summary}>
              <h3 className={styles.summaryTitle}>Tu personalización</h3>

              <div className={styles.summaryList}>
                {options.map((option) => {
                  const selectedValue = option.values.find(
                    (v) => v.id === selectedOptions[option.id]
                  )

                  return (
                    <div key={option.id} className={styles.summaryItem}>
                      <div className={styles.summaryHeader}>
                        <span className={styles.summaryLabel}>{option.name}</span>
                        {option.is_required && !selectedValue && (
                          <span className={styles.requiredDot}>*</span>
                        )}
                        {selectedValue && (
                          <Check size={16} className={styles.checkIcon} />
                        )}
                      </div>

                      {selectedValue ? (
                        <div className={styles.summaryValue}>
                          {selectedValue.hex_color && (
                            <span
                              className={styles.colorDot}
                              style={{ backgroundColor: selectedValue.hex_color }}
                            />
                          )}
                          <span>{selectedValue.value}</span>
                          {selectedValue.additional_price > 0 && (
                            <span className={styles.additionalPrice}>
                              +{formatPrice(selectedValue.additional_price)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className={styles.summaryEmpty}>No seleccionado</p>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className={styles.totalSection}>
                <div className={styles.totalRow}>
                  <span className={styles.totalLabel}>Precio base</span>
                  <span className={styles.totalValue}>{formatPrice(product.price)}</span>
                </div>
                {quantity > 1 && (
                  <div className={styles.totalRow}>
                    <span className={styles.totalLabel}>Cantidad</span>
                    <span className={styles.totalValue}>× {quantity}</span>
                  </div>
                )}
                <div className={styles.totalRowFinal}>
                  <span className={styles.totalLabelFinal}>Total</span>
                  <span className={styles.totalPriceFinal}>{formatPrice(calculateTotalPrice())}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>

 {/* ✅ NUEVO: Resumen flotante móvil */}
        <div className={styles.mobileSummary}>
          <div className={styles.mobileSummaryContent}>
            <div className={styles.mobilePriceInfo}>
              <div className={styles.mobilePriceLabel}>Total</div>
              <div className={styles.mobilePriceValue}>
                {formatPrice(calculateTotalPrice())}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className={styles.mobileDetailsButton}
              style={{ position: 'relative' }}
            >
              Detalles
              {quantity > 1 && (
                <span className={styles.mobileQuantityBadge}>{quantity}</span>
              )}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* ✅ NUEVO: Drawer de detalles móvil */}
        <>
          <div
            className={`${styles.mobileDrawerOverlay} ${isDrawerOpen ? 'open' : ''}`}
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className={`${styles.mobileDrawer} ${isDrawerOpen ? styles.mobileDrawerOpen : ''}`}>
            <div className={styles.mobileDrawerHeader}>
              <h3 className={styles.mobileDrawerTitle}>
                ✨ Tu personalización
              </h3>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className={styles.mobileDrawerClose}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.mobileDrawerContent}>
              <div className={styles.mobileDrawerList}>
                {options.map((option) => {
                  const selectedValue = option.values.find(
                    (v) => v.id === selectedOptions[option.id]
                  )

                  return (
                    <div
                      key={option.id}
                      className={`${styles.mobileDrawerItem} ${selectedValue ? 'selected' : ''}`}
                    >
                      <div className={styles.mobileDrawerItemHeader}>
                        <span className={styles.mobileDrawerLabel}>{option.name}</span>
                        {selectedValue && <Check size={16} style={{ color: '#10b981' }} />}
                      </div>

                      {selectedValue ? (
                        <div className={styles.mobileDrawerValue}>
                          {selectedValue.hex_color && (
                            <span
                              className={styles.mobileColorDot}
                              style={{ backgroundColor: selectedValue.hex_color }}
                            />
                          )}
                          <span>{selectedValue.value}</span>
                          {selectedValue.additional_price > 0 && (
                            <span className={styles.mobileAdditionalPrice}>
                              +{formatPrice(selectedValue.additional_price)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className={styles.mobileDrawerEmpty}>No seleccionado</p>
                      )}
                    </div>
                  )
                })}

                {/* Cantidad */}
                <div className={`${styles.mobileDrawerItem} selected`}>
                  <div className={styles.mobileDrawerItemHeader}>
                    <span className={styles.mobileDrawerLabel}>Cantidad</span>
                    <Check size={16} style={{ color: '#10b981' }} />
                  </div>
                  <div className={styles.mobileDrawerValue}>
                    <span>{quantity} {quantity === 1 ? 'unidad' : 'unidades'}</span>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className={styles.mobileDrawerTotal}>
                <div className={styles.mobileDrawerTotalRow}>
                  <span className={styles.mobileDrawerTotalLabel}>Total</span>
                  <span className={styles.mobileDrawerTotalPrice}>
                    {formatPrice(calculateTotalPrice())}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>

      </Container>

    </div>
  )
}
