"use client"
import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Calculator } from 'lucide-react'
import styles from './CreateOrderModal.module.css'
import { calculateShipping } from '@/lib/shipping/rates'
import { colombiaDepartments } from '@/lib/data/colombia-locations'

interface Product {
    id: string
    name: string
    slug: string
    price: number
    base_price: number
    image?: string
    is_active: boolean
  }

interface OrderItem {
  product_id: string
  product_name: string
  product_slug: string
  product_image?: string
  base_price: number
  customization_details?: any
  quantity: number
  unit_price: number
  total_price: number
}

interface CreateOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const DEFAULT_SHIPPING_STATE = 'Cauca'
const DEFAULT_SHIPPING_CITY = 'Popayán'

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function getProductTypeSingular(productName: string, productSlug?: string): string {
  const slug = normalizeText(productSlug || '')
  const name = normalizeText(productName)

  if (slug.includes('arete') || slug.includes('pendiente') || slug.includes('candonga') || slug.includes('topo')) return 'arete'
  if (slug.includes('collar') || slug.includes('gargantilla') || slug.includes('choker')) return 'collar'
  if (slug.includes('pulsera') || slug.includes('manilla') || slug.includes('brazalete')) return 'pulsera'
  if (slug.includes('anillo') || slug.includes('sortija')) return 'anillo'
  if (slug.includes('tobillera')) return 'tobillera'
  if (slug.includes('set') || slug.includes('combo') || slug.includes('kit')) return 'set'
  if (slug.includes('llavero')) return 'llavero'

  if (name.includes('arete') || name.includes('pendiente') || name.includes('candonga') || name.includes('topo')) return 'arete'
  if (name.includes('collar') || name.includes('gargantilla') || name.includes('choker')) return 'collar'
  if (name.includes('pulsera') || name.includes('manilla') || name.includes('brazalete')) return 'pulsera'
  if (name.includes('anillo') || name.includes('sortija')) return 'anillo'
  if (name.includes('tobillera')) return 'tobillera'
  if (name.includes('set') || name.includes('combo') || name.includes('kit')) return 'set'
  if (name.includes('llavero')) return 'llavero'

  return 'accesorio'
}

function getProductDisplayLabel(product: Product): string {
  const typeLabel = getProductTypeSingular(product.name, product.slug)
  const normalizedName = normalizeText(product.name)

  if (normalizedName.startsWith(typeLabel)) {
    return product.name
  }

  return `${typeLabel} ${product.name}`
}

export default function CreateOrderModal({ isOpen, onClose, onSuccess }: CreateOrderModalProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Datos del cliente
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerDocument, setCustomerDocument] = useState('')
  
  // Dirección de envío
  const [shippingAddress, setShippingAddress] = useState('')
  const [selectedState, setSelectedState] = useState(DEFAULT_SHIPPING_STATE)
  const [selectedCity, setSelectedCity] = useState(DEFAULT_SHIPPING_CITY)
  const [shippingZip, setShippingZip] = useState('')
  
  // Items de la orden
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  
  // Estado y método de pago
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [orderStatus, setOrderStatus] = useState<'pending' | 'paid' | 'processing'>('pending')
  const [customerNotes, setCustomerNotes] = useState('')

  const [shippingCost, setShippingCost] = useState<number>(0)

  // Cálculos
  const subtotal = orderItems.reduce((sum, item) => sum + item.total_price, 0)
  const total = subtotal + shippingCost

  // Ciudades disponibles según el departamento seleccionado
  const availableCities = selectedState
    ? colombiaDepartments.find(d => d.name === selectedState)?.cities || []
    : []

  useEffect(() => {
    if (isOpen) {
      fetchProducts()
    }
  }, [isOpen])

  const fetchProducts = async () => {
    try {
        const response = await fetch('/api/admin/products')
        if (response.ok) {
          const data = await response.json()
          setProducts(data.filter((p: Product) => p.is_active))
        }
      } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setIsLoadingProducts(false)
    }
  }

  const handleAddProduct = () => {
    if (products.length === 0) return
    
    const firstProduct = products[0]
    const newItem: OrderItem = {
      product_id: firstProduct.id,
      product_name: firstProduct.name,
      product_slug: firstProduct.slug,
      product_image: firstProduct.image,
      base_price: firstProduct.base_price || firstProduct.price,
      quantity: 1,
      unit_price: firstProduct.base_price || firstProduct.price,
      total_price: firstProduct.base_price || firstProduct.price
    }
    setOrderItems([...orderItems, newItem])
  }

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  const handleUpdateItem = (index: number, field: keyof OrderItem, value: any) => {
    const updated = [...orderItems]
    const item = { ...updated[index] }
    
    if (field === 'product_id') {
      const product = products.find(p => p.id === value)
      if (product) {
        item.product_id = product.id
        item.product_name = product.name
        item.product_slug = product.slug
        item.product_image = product.image
        item.base_price = product.base_price || product.price
        item.unit_price = product.base_price || product.price
        item.total_price = item.unit_price * item.quantity
      }
    } else if (field === 'quantity') {
      item.quantity = Math.max(1, parseInt(value) || 1)
      item.total_price = item.unit_price * item.quantity
    } else if (field === 'unit_price') {
      item.unit_price = parseFloat(value) || 0
      item.total_price = item.unit_price * item.quantity
    }
    
    updated[index] = item
    setOrderItems(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!customerName || !customerEmail || !customerPhone || !customerDocument) {
      alert('Por favor completa todos los datos del cliente')
      return
    }

    if (!shippingAddress || !selectedState || !selectedCity) {
      alert('Por favor completa la dirección de envío')
      return
    }

    if (orderItems.length === 0) {
      alert('Debes agregar al menos un producto')
      return
    }

    setIsSubmitting(true)

    try {
      const orderData = {
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        customer_document: customerDocument,
        shipping_address: shippingAddress,
        shipping_city: selectedCity,
        shipping_state: selectedState,
        shipping_zip: shippingZip,
        shipping_country: 'Colombia',
        subtotal,
        shipping_cost: shippingCost,
        total,
        customer_notes: customerNotes,
        items: orderItems,
        payment_method: paymentMethod || undefined,
        payment_status: paymentStatus,
        status: paymentStatus === 'approved' ? orderStatus : 'pending'
      }

      const response = await fetch('/api/admin/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear la orden')
      }

      const order = await response.json()
      alert(`Orden ${order.order_number} creada exitosamente`)
      onSuccess()
      handleClose()
    } catch (error: any) {
      console.error('Error creating order:', error)
      alert(error.message || 'Error al crear la orden')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setCustomerName('')
    setCustomerEmail('')
    setCustomerPhone('')
    setCustomerDocument('')
    setShippingAddress('')
    setSelectedState(DEFAULT_SHIPPING_STATE)
    setSelectedCity(DEFAULT_SHIPPING_CITY)
    setShippingZip('')
    setOrderItems([])
    setPaymentMethod('')
    setPaymentStatus('pending')
    setOrderStatus('pending')
    setCustomerNotes('')
    setShippingCost(0)
    onClose()
  }

  const handleCalculateShipping = () => {
    if (selectedState && selectedCity) {
      const calculated = calculateShipping(selectedState, selectedCity, subtotal)
      setShippingCost(calculated)
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Crear Orden Manual</h2>
          <button className={styles.closeButton} onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Datos del Cliente */}
          <section className={styles.section}>
            <h3>Datos del Cliente</h3>
            <div className={styles.grid}>
              <div className={styles.field}>
                <label>Nombre completo *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label>Email *</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label>Teléfono *</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label>Documento *</label>
                <input
                  type="text"
                  value={customerDocument}
                  onChange={(e) => setCustomerDocument(e.target.value)}
                  required
                />
              </div>
            </div>
          </section>

          {/* Dirección de Envío */}
          <section className={styles.section}>
            <h3>Dirección de Envío</h3>
            <div className={styles.grid}>
              <div className={styles.field}>
                <label>Dirección *</label>
                <input
                  type="text"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label>Departamento *</label>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value)
                    setSelectedCity('')
                  }}
                  required
                >
                  <option value="">Seleccionar...</option>
                  {colombiaDepartments.map(dept => (
                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label>Ciudad *</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  required
                  disabled={!selectedState}
                >
                  <option value="">Seleccionar...</option>
                  {availableCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label>Código Postal</label>
                <input
                  type="text"
                  value={shippingZip}
                  onChange={(e) => setShippingZip(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Productos */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>Productos</h3>
              <button
                type="button"
                onClick={handleAddProduct}
                className={styles.addButton}
                disabled={isLoadingProducts || products.length === 0}
              >
                <Plus size={16} />
                Agregar Producto
              </button>
            </div>

            {isLoadingProducts ? (
              <p>Cargando productos...</p>
            ) : orderItems.length === 0 ? (
              <p className={styles.emptyText}>No hay productos agregados</p>
            ) : (
              <div className={styles.itemsList}>
                {orderItems.map((item, index) => (
                  <div key={index} className={styles.itemRow}>
                    <div className={styles.itemField}>
                      <label>Producto</label>
                      <select
                        value={item.product_id}
                        onChange={(e) => handleUpdateItem(index, 'product_id', e.target.value)}
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{getProductDisplayLabel(p)}</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.itemField}>
                      <label>Cantidad</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(index, 'quantity', e.target.value)}
                      />
                    </div>
                    <div className={styles.itemField}>
                      <label>Precio Unitario</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => handleUpdateItem(index, 'unit_price', e.target.value)}
                      />
                    </div>
                    <div className={styles.itemField}>
                      <label>Total</label>
                      <input
                        type="text"
                        value={new Intl.NumberFormat('es-CO', {
                          style: 'currency',
                          currency: 'COP',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(item.total_price)}
                        readOnly
                        className={styles.readOnly}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className={styles.removeButton}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Resumen y Pago */}
          <section className={styles.section}>
            <h3>Resumen y Pago</h3>
            <div className={styles.summary}>
              <div className={styles.summaryRow}>
                <span>Subtotal:</span>
                <span>{new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(subtotal)}</span>
              </div>
              <div className={styles.summaryRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Envío:</span>
                  {selectedState && selectedCity && (
                    <button
                      type="button"
                      onClick={handleCalculateShipping}
                      className={styles.calculateButton}
                      title="Calcular envío automáticamente"
                    >
                      <Calculator size={14} />
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                  className={styles.shippingInput}
                />
              </div>
              <div className={styles.summaryRowTotal}>
                <span>Total:</span>
                <span>{new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(total)}</span>
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label>Método de Pago</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="">Seleccionar...</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="nequi">Nequi</option>
                  <option value="daviplata">Daviplata</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>Estado de Pago</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as any)}
                >
                  <option value="pending">Pendiente</option>
                  <option value="approved">Aprobado</option>
                  <option value="rejected">Rechazado</option>
                </select>
              </div>
              {paymentStatus === 'approved' && (
                <div className={styles.field}>
                  <label>Estado de la Orden</label>
                  <select
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value as any)}
                  >
                    <option value="paid">Pagado</option>
                    <option value="processing">Procesando</option>
                  </select>
                </div>
              )}
            </div>

            <div className={styles.field}>
              <label>Notas (opcional)</label>
              <textarea
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                rows={3}
              />
            </div>
          </section>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={handleClose}
              className={styles.cancelButton}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creando...' : 'Crear Orden'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}