"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/context/CartContext"
import { ShoppingBag, CreditCard, MapPin, User, FileText } from "lucide-react"
import Image from "next/image"
import styles from "./page.module.css"
import LocationSelector from '@/components/checkout/LocationSelector'
import { calculateShipping, getShippingMessage, FREE_SHIPPING_THRESHOLD } from '@/lib/shipping/rates'
import Link from "next/link"


export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

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
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false)

  const subtotal = items.reduce((sum, item) => sum + (item.totalPrice), 0)
  const [shippingCost, setShippingCost] = useState(0)

  useEffect(() => {
    if (formData.shipping_state) {
      const cost = calculateShipping(formData.shipping_state, formData.shipping_city, subtotal)
      setShippingCost(cost)
    } else {
      setShippingCost(0)
    }
  }, [formData.shipping_state, formData.shipping_city, subtotal])

  // Total final
  const total = subtotal + shippingCost

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const renderSummary = () => (
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
              {item.selectedOptions.map((opt: any) => (
                <p key={opt.optionId} className={styles.itemOption}>
                  {opt.optionName}: {opt.valueName}
                </p>
              ))}
            </div>
            <div className={styles.itemPrice}>
              {formatPrice(item.totalPrice)}
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className={styles.totals}>
        <div className={styles.totalRow}>
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        <div className={styles.totalRow}>
          <span>Envío</span>
          <span>
            {shippingCost === 0
              ? (subtotal >= FREE_SHIPPING_THRESHOLD ? '¡GRATIS!' : 'Por calcular')
              : formatPrice(shippingCost)
            }
          </span>
        </div>

        {subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD && formData.shipping_state && (
          <div className={styles.shippingMessage}>
            {getShippingMessage(formData.shipping_state, formData.shipping_city, subtotal)}
          </div>
        )}

        {subtotal >= FREE_SHIPPING_THRESHOLD && (
          <div className={styles.freeShippingBanner}>
            ✨ ¡Felicidades! Tienes envío gratis
          </div>
        )}

        <div className={`${styles.totalRow} ${styles.totalFinal}`}>
          <span>Total</span>
          <span>{formatPrice(total)}</span>
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
  )

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

    // ← AGREGAR VALIDACIÓN DE TÉRMINOS
    if (!acceptTerms) {
      alert('Debes aceptar los términos y condiciones para continuar')
      return
    }

    setIsProcessing(true)

    try {
      // Newsletter subscription
      if (subscribeNewsletter) {
        try {
          await fetch('/api/newsletter/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: formData.customer_email,
              name: formData.customer_name,
              source: 'checkout'
            })
          })
        } catch (error) {
          console.error('Error subscribing to newsletter:', error)
        }
      }

      // 1. Crear la orden en Supabase
      const orderData = {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        customer_document: formData.customer_document,
        shipping_address: formData.shipping_address,
        shipping_city: formData.shipping_city,
        shipping_state: formData.shipping_state,
        shipping_zip: formData.shipping_zip || null,
        shipping_country: 'Colombia',
        subtotal: subtotal,
        shipping_cost: shippingCost,
        total: total,
        customer_notes: formData.customer_notes || null,
        items: items.map(item => ({
          product_id: item.productId,
          product_name: item.productName,
          product_slug: item.productSlug,
          product_image: item.productImage,
          base_price: item.basePrice,
          customization_details: item.selectedOptions,
          quantity: item.quantity,
          unit_price: item.totalPrice / item.quantity,
          total_price: item.totalPrice
        }))
      }

      console.log('🚀 Sending order data:', orderData)

      const createOrderResponse = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (!createOrderResponse.ok) {
        const errorData = await createOrderResponse.json()
        console.error('❌ Order creation failed:', errorData)
        throw new Error('Error al crear la orden')
      }

      const order = await createOrderResponse.json()
      console.log('✅ Order created:', order)
      // 2. Crear preferencia de MercadoPago
      const preferenceResponse = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          orderNumber: order.order_number,
          items: [
            // Items del carrito
            ...items.map(item => ({
              product_id: item.productId,
              product_name: item.productName,
              product_image: item.productImage,
              quantity: item.quantity,
              unit_price: item.totalPrice / item.quantity,
              customization_summary: item.selectedOptions
                .map((opt: any) => `${opt.optionName}: ${opt.valueName}`)
                .join(', ')
            })),
            // ✅ Agregar envío como item si tiene costo
            ...(shippingCost > 0 ? [{
              product_id: 'shipping',
              product_name: `Envío a ${formData.shipping_city}, ${formData.shipping_state}`,
              product_image: null,
              quantity: 1,
              unit_price: shippingCost,
              customization_summary: 'Costo de envío'
            }] : [])
          ],
          payer: {
            name: formData.customer_name,
            email: formData.customer_email,
            phone: formData.customer_phone,
            document: formData.customer_document,
            address: formData.shipping_address,
            zip_code: formData.shipping_zip
          },
          total: total // Este total YA incluye shipping
        })
      })

      if (!preferenceResponse.ok) {
        throw new Error('Error al crear la preferencia de pago')
      }

      const { initPoint } = await preferenceResponse.json()
      console.log('✅ Payment URL:', initPoint)

      // Mostrar overlay PRIMERO
      setIsProcessing(false)
      setIsRedirecting(true)

      // Limpiar carrito DESPUÉS
      clearCart()

      console.log('🟢 Overlay activado, redirigiendo en 800ms...')

      // Redirigir después de 1 segundo
      setTimeout(() => {
        console.log('🚀 Redirigiendo a:', initPoint)
        window.location.href = initPoint
      }, 1000)

    } catch (error) {
      console.error('Error processing checkout:', error)
      setIsProcessing(false)
      setIsRedirecting(false)
      alert('Hubo un error al procesar tu pedido. Por favor intenta de nuevo.')
    }
  }

  // ✅ CAMBIAR LA CONDICIÓN DE RETORNO
  // Si no hay items Y NO estamos redirigiendo, mostrar mensaje
  if (items.length === 0 && !isRedirecting) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.emptyCart}>
            <h1 className={styles.title}>Carrito Vacío</h1>
            <p className={styles.subtitle}>
              No tienes productos en tu carrito
            </p>
            <Link href="/productos" className={styles.shopButton}>
              Ver Productos
            </Link>
          </div>
        </div>
      </div>
    )
  }
  return (
    <>
      <div className={styles.page}>
        <div className={styles.container}>
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
                        placeholder="3005469257"
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
                        placeholder="3005469257"
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

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Dirección *
                    </label>
                    <input
                      type="text"
                      name="shipping_address"
                      value={formData.shipping_address}
                      onChange={handleInputChange}
                      placeholder="Calle 123 #45-67"
                      className={`${styles.input} ${errors.shipping_address ? styles.inputError : ''}`}
                    />
                    {errors.shipping_address && (
                      <p className={styles.error}>{errors.shipping_address}</p>
                    )}
                  </div>

                  {/* Location Selector Component */}
                  <LocationSelector
                    selectedState={formData.shipping_state}
                    selectedCity={formData.shipping_city}
                    onStateChange={(state) => setFormData(prev => ({ ...prev, shipping_state: state }))}
                    onCityChange={(city) => setFormData(prev => ({ ...prev, shipping_city: city }))}
                    errors={{
                      state: errors.shipping_state,
                      city: errors.shipping_city
                    }}
                  />

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Código Postal (opcional)
                    </label>
                    <input
                      type="text"
                      name="shipping_zip"
                      value={formData.shipping_zip}
                      onChange={handleInputChange}
                      placeholder="110111"
                      className={styles.input}
                    />
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

                {/* Términos y Newsletter */}
                <div className={styles.section}>
                  <div className={styles.checkboxGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className={styles.checkbox}
                      />
                      <span className={styles.checkboxText}>
                        Acepto los{' '}
                        <Link href="/terminos" target="_blank" className={styles.link}>
                          Términos y Condiciones
                        </Link>{' '}
                        y la{' '}
                        <Link href="/privacidad" target="_blank" className={styles.link}>
                          Política de Privacidad
                        </Link>
                        <span className={styles.required}> *</span>
                      </span>
                    </label>

                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={subscribeNewsletter}
                        onChange={(e) => setSubscribeNewsletter(e.target.checked)}
                        className={styles.checkbox}
                      />
                      <span className={styles.checkboxText}>
                        Quiero recibir novedades, ofertas exclusivas y tips sobre accesorios por email
                      </span>
                    </label>
                  </div>

                  <p className={`${styles.donationNote} ${styles.donationNoteStandalone}`}>
                    <span aria-hidden="true" className={styles.donationNoteIcon}>
                      ❤️
                    </span>
                    Destinamos el 5% de tu compra a una causa benéfica cada mes.
                  </p>

                  {!acceptTerms && (
                    <p className={styles.termsWarning}>
                      * Debes aceptar los términos para continuar
                    </p>
                  )}
                </div>
                {/* Resumen (móvil) */}
                <div className={styles.summaryMobile}>
                  {renderSummary()}
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
              {renderSummary()}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay de redirección - FUERA del div.page */}
      {isRedirecting && (
        <div className={styles.redirectOverlay}>
          <div className={styles.redirectContent}>
            <div className={styles.redirectSpinnerWrapper}>
              <div className={styles.redirectSpinner}></div>
              <div className={styles.redirectLogo}>
                <Image
                  src="/logo.png"
                  alt="Niñamar"
                  width={60}
                  height={60}
                  className={styles.logoImage}
                />
              </div>
            </div>
            <h2 className={styles.redirectTitle}>Redirigiendo a MercadoPago...</h2>
            <p className={styles.redirectText}>
              Por favor espera mientras te redirigimos a la pasarela de pago segura
            </p>
            <div className={styles.redirectIcons}>
              <span>💳</span>
              <span>🔒</span>
              <span>✨</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}