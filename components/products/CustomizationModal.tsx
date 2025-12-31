"use client"

import { useState, useEffect } from "react"
import { X, Plus, Minus, ShoppingCart, Sparkles } from "lucide-react"
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
  const [engraving, setEngraving] = useState("")

  // NUEVO: Calcular total de pasos (opciones + paso final solo si hay grabado o siempre mostrar cantidad)
  const totalSteps = options.length + 1 // Siempre hay paso final para cantidad

  // Prevenir scroll cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Calcular precio total
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
    // Validar que todas las opciones requeridas estén seleccionadas
    const requiredOptions = options.filter(opt => opt.is_required)
    const missingRequired = requiredOptions.some(opt => !selectedOptions[opt.id])

    if (missingRequired) {
      alert('Por favor selecciona todas las opciones requeridas')
      return
    }

    const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0]

    // Construir las opciones seleccionadas con detalles
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

    // Crear item del carrito
    const cartItem = {
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: primaryImage?.image_url || '',
      basePrice: product.price,
      selectedOptions: selectedOptionsDetails,
      engraving: engraving.trim() || undefined, // NUEVO: Solo incluir si tiene texto
      quantity: quantity,
      totalPrice: calculateTotalPrice()
    }

    addItem(cartItem)
    onClose()
  }

  const currentOption = options[currentStep]
  const isLastStep = currentStep === options.length
  const canContinue = !currentOption?.is_required || selectedOptions[currentOption?.id]

  if (!isOpen) return null

  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0]

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <Sparkles className={styles.headerIcon} />
            <h2 className={styles.title}>Personaliza tu {product.name}</h2>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        {/* Progress */}
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

        {/* Content */}
        <div className={styles.content}>
          {/* Product Preview */}
          <div className={styles.preview}>
            <div className={styles.previewImage}>
              {primaryImage ? (
                <Image
                  src={primaryImage.image_url}
                  alt={product.name}
                  fill
                  className={styles.image}
                  sizes="400px"
                />
              ) : (
                <div className={styles.imagePlaceholder}>💎</div>
              )}
            </div>
            <div className={styles.previewInfo}>
              <h3 className={styles.productName}>{product.name}</h3>
              <div className={styles.priceInfo}>
                <span className={styles.basePrice}>Precio base:</span>
                <span className={styles.price}>{formatPrice(product.price)}</span>
              </div>
              {Object.keys(selectedOptions).length > 0 && (
                <div className={styles.selectedOptions}>
                  <h4 className={styles.selectedTitle}>Tu selección:</h4>
                  {options.map(option => {
                    const valueId = selectedOptions[option.id]
                    const value = option.values.find(v => v.id === valueId)
                    if (!value) return null
                    
                    return (
                      <div key={option.id} className={styles.selectedItem}>
                        <span className={styles.selectedLabel}>{option.name}:</span>
                        <span className={styles.selectedValue}>
                          {value.value}
                          {value.additional_price > 0 && (
                            <span className={styles.additionalPrice}>
                              +{formatPrice(value.additional_price)}
                            </span>
                          )}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Options */}
          <div className={styles.options}>
            {!isLastStep && currentOption ? (
              <div className={styles.optionSection}>
                <h3 className={styles.optionTitle}>
                  {currentOption.name}
                  {currentOption.is_required && (
                    <span className={styles.required}>*</span>
                  )}
                </h3>

                <div className={styles.optionGrid}>
                  {currentOption.values.map((value) => {
                    const isSelected = selectedOptions[currentOption.id] === value.id

                    return (
                      <button
                        key={value.id}
                        onClick={() => handleOptionSelect(currentOption.id, value.id)}
                        className={`${styles.optionButton} ${isSelected ? styles.optionButtonActive : ''}`}
                      >
                        {value.hex_color && (
                          <div 
                            className={styles.colorCircle}
                            style={{ backgroundColor: value.hex_color }}
                          />
                        )}
                        <span className={styles.optionValue}>{value.value}</span>
                        {value.additional_price > 0 && (
                          <span className={styles.optionPrice}>
                            +{formatPrice(value.additional_price)}
                          </span>
                        )}
                        {isSelected && (
                          <span className={styles.checkmark}>✓</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              // Último paso - Grabado (solo si está permitido) y Cantidad
              <div className={styles.finalStep}>
                <h3 className={styles.optionTitle}>Detalles Finales</h3>
            

                <div className={styles.quantitySection}>
                  <label className={styles.label}>Cantidad</label>
                  <div className={styles.quantityControls}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className={styles.quantityButton}
                      disabled={quantity <= 1}
                    >
                      <Minus size={20} />
                    </button>
                    <span className={styles.quantityValue}>{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className={styles.quantityButton}
                      disabled={quantity >= product.stock}
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <p className={styles.hint}>
                    Stock disponible: {product.stock}
                  </p>
                </div>

                <div className={styles.totalSection}>
                  <div className={styles.totalRow}>
                    <span className={styles.totalLabel}>Total:</span>
                    <span className={styles.totalPrice}>
                      {formatPrice(calculateTotalPrice())}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
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
              className={styles.nextButton}
            >
              Continuar
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
  )
}