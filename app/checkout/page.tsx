"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/context/CartContext"
import Container from "@/components/ui/Container"
import { ShoppingBag, CreditCard, MapPin, User, Phone, Mail, FileText } from "lucide-react"
import Image from "next/image"
import styles from "./page.module.css"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)

  // Formulario
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_document: '',
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_zip: '',
    customer_notes: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Redirigir si el carrito está vacío
  useEffect(() => {
    if (items.length === 0) {
      router.push('/productos')
    }
  }, [items, router])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'El nombre es requerido'
    }

    if (!formData.customer_email.trim()) {
      newErrors.customer_email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      newErrors.customer_email = 'Email inválido'
    }

    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = 'El teléfono es requerido'
    }

    if (!formData.customer_document.trim()) {
      newErrors.customer_document = 'El documento es requerido'
    }

    if (!formData.shipping_address.trim()) {
      newErrors.shipping_address = 'La dirección es requerida'
    }

    if (!formData.shipping_city.trim()) {
      newErrors.shipping_city = 'La ciudad es requerida'
    }

    if (!formData.shipping_state.trim()) {
      newErrors.shipping_state = 'El departamento es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsProcessing(true)

    try {
      // 1. Crear la orden en Supabase
      const orderData = {
        ...formData,
        items: items.map(item => ({
          product_id: item.productId,
          product_name: item.productName,
          product_slug: item.productSlug,
          product_image: item.productImage,
          base_price: item.basePrice,
          customization_details: item.selectedOptions,
          engraving: item.engraving,
          quantity: item.quantity,
          unit_price: item.totalPrice / item.quantity,
          total_price: item.totalPrice
        }))
      }

      const createOrderResponse = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (!createOrderResponse.ok) {
        throw new Error('Error al crear la orden')
      }

      const order = await createOrderResponse.json()

      // 2. Crear preferencia de MercadoPago
      const preferenceResponse = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          orderNumber: order.order_number,
          items: items.map(item => ({
            product_id: item.productId,
            product_name: item.productName,
            product_image: item.productImage,
            quantity: item.quantity,
            unit_price: item.totalPrice / item.quantity,
            customization_summary: item.selectedOptions
              .map(opt => `${opt.optionName}: ${opt.valueName}`)
              .join(', ')
          })),
          payer: {
            name: formData.customer_name,
            email: formData.customer_email,
            phone: formData.customer_phone,
            document: formData.customer_document,
            address: formData.shipping_address,
            zip_code: formData.shipping_zip
          },
          total: totalPrice
        })
      })

      if (!preferenceResponse.ok) {
        throw new Error('Error al crear la preferencia de pago')
      }

      const { initPoint } = await preferenceResponse.json()

      // 3. Limpiar carrito
      clearCart()

      // 4. Redirigir a MercadoPago
      window.location.href = initPoint

    } catch (error) {
      console.error('Error processing checkout:', error)
      alert('Hubo un error al procesar tu pedido. Por favor intenta de nuevo.')
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className={styles.page}>
      <Container>
        <div className={styles.header}>
          <h1 className={styles.title}>Finalizar Compra</h1>
          <p className={styles.subtitle}>Completa tus datos para proceder al pago</p>
        </div>

        <div className={styles.layout}>
          {/* Formulario */}
          <div className={styles.formSection}>
            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Información Personal */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <User className={styles.sectionIcon} />
                  <h2 className={styles.sectionTitle}>Información Personal</h2>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      className={`${styles.input} ${errors.customer_name ? styles.inputError : ''}`}
                      placeholder="Juan Pérez"
                    />
                    {errors.customer_name && (
                      <span className={styles.error}>{errors.customer_name}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Documento de identidad *
                    </label>
                    <input
                      type="text"
                      name="customer_document"
                      value={formData.customer_document}
                      onChange={handleInputChange}
                      className={`${styles.input} ${errors.customer_document ? styles.inputError : ''}`}
                      placeholder="1234567890"
                    />
                    {errors.customer_document && (
                      <span className={styles.error}>{errors.customer_document}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Email *
                    </label>
                    <input
                      type="email"
                      name="customer_email"
                      value={formData.customer_email}
                      onChange={handleInputChange}
                      className={`${styles.input} ${errors.customer_email ? styles.inputError : ''}`}
                      placeholder="juan@ejemplo.com"
                    />
                    {errors.customer_email && (
                      <span className={styles.error}>{errors.customer_email}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="customer_phone"
                      value={formData.customer_phone}
                      onChange={handleInputChange}
                      className={`${styles.input} ${errors.customer_phone ? styles.inputError : ''}`}
                      placeholder="3001234567"
                    />
                    {errors.customer_phone && (
                      <span className={styles.error}>{errors.customer_phone}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Dirección de Envío */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <MapPin className={styles.sectionIcon} />
                  <h2 className={styles.sectionTitle}>Dirección de Envío</h2>
                </div>

                <div className={styles.formGrid}>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>
                      Dirección completa *
                    </label>
                    <input
                      type="text"
                      name="shipping_address"
                      value={formData.shipping_address}
                      onChange={handleInputChange}
                      className={`${styles.input} ${errors.shipping_address ? styles.inputError : ''}`}
                      placeholder="Calle 123 # 45-67, Apto 101"
                    />
                    {errors.shipping_address && (
                      <span className={styles.error}>{errors.shipping_address}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      name="shipping_city"
                      value={formData.shipping_city}
                      onChange={handleInputChange}
                      className={`${styles.input} ${errors.shipping_city ? styles.inputError : ''}`}
                      placeholder="Bogotá"
                    />
                    {errors.shipping_city && (
                      <span className={styles.error}>{errors.shipping_city}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Departamento *
                    </label>
                    <input
                      type="text"
                      name="shipping_state"
                      value={formData.shipping_state}
                      onChange={handleInputChange}
                      className={`${styles.input} ${errors.shipping_state ? styles.inputError : ''}`}
                      placeholder="Cundinamarca"
                    />
                    {errors.shipping_state && (
                      <span className={styles.error}>{errors.shipping_state}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Código postal (opcional)
                    </label>
                    <input
                      type="text"
                      name="shipping_zip"
                      value={formData.shipping_zip}
                      onChange={handleInputChange}
                      className={styles.input}
                      placeholder="110111"
                    />
                  </div>
                </div>
              </div>

              {/* Notas adicionales */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <FileText className={styles.sectionIcon} />
                  <h2 className={styles.sectionTitle}>Notas Adicionales (Opcional)</h2>
                </div>

                <div className={styles.formGroup}>
                  <textarea
                    name="customer_notes"
                    value={formData.customer_notes}
                    onChange={handleInputChange}
                    className={styles.textarea}
                    placeholder="¿Alguna instrucción especial para la entrega?"
                    rows={4}
                  />
                </div>
              </div>

              {/* Botón de envío */}
              <button
                type="submit"
                disabled={isProcessing}
                className={styles.submitButton}
              >
                {isProcessing ? (
                  <>
                    <span className={styles.spinner}></span>
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    Proceder al Pago
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Resumen del pedido */}
          <div className={styles.summarySection}>
            <div className={styles.summary}>
              <div className={styles.summaryHeader}>
                <ShoppingBag className={styles.summaryIcon} />
                <h2 className={styles.summaryTitle}>Resumen del Pedido</h2>
              </div>

              <div className={styles.summaryItems}>
                {items.map((item) => (
                  <div key={item.id} className={styles.summaryItem}>
                    <div className={styles.itemImage}>
                      {item.productImage ? (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          className={styles.image}
                          sizes="80px"
                        />
                      ) : (
                        <div className={styles.imagePlaceholder}>💎</div>
                      )}
                    </div>
                    <div className={styles.itemDetails}>
                      <h3 className={styles.itemName}>{item.productName}</h3>
                      <p className={styles.itemQuantity}>Cantidad: {item.quantity}</p>
                      {item.selectedOptions.map((opt) => (
                        <p key={opt.optionId} className={styles.itemOption}>
                          {opt.optionName}: {opt.valueName}
                        </p>
                      ))}
                      {item.engraving && (
                        <p className={styles.itemEngraving}>
                          Grabado: "{item.engraving}"
                        </p>
                      )}
                    </div>
                    <div className={styles.itemPrice}>
                      {formatPrice(item.totalPrice)}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.summaryTotals}>
                <div className={styles.totalRow}>
                  <span>Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className={styles.totalRow}>
                  <span>Envío</span>
                  <span className={styles.free}>Gratis</span>
                </div>
                <div className={`${styles.totalRow} ${styles.totalFinal}`}>
                  <span>Total</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <div className={styles.securePayment}>
                <span className={styles.secureIcon}>🔒</span>
                <p className={styles.secureText}>
                  Pago seguro con MercadoPago
                  <br />
                  <small>PSE, Tarjetas, Efectivo y más</small>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}