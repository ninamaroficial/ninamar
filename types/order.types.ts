export interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  customer_document?: string
  shipping_address: string
  shipping_city: string
  shipping_state: string
  shipping_zip?: string
  shipping_country: string
  subtotal: number
  shipping_cost: number
  total: number
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  payment_method?: string
  payment_status: 'pending' | 'approved' | 'rejected'
  payment_id?: string
  customer_notes?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id?: string
  product_name: string
  product_slug?: string
  product_image?: string
  base_price: number
  customization_details?: any
  engraving?: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface CreateOrderData {
  customer_name: string
  customer_email: string
  customer_phone: string  // ← Cambiado a requerido (sin ?)
  customer_document: string  // ← Cambiado a requerido (sin ?)
  shipping_address: string
  shipping_city: string
  shipping_state: string
  shipping_zip?: string
  shipping_country?: string  // ← Agregado (opcional, default 'Colombia')
  subtotal: number  // ← Agregado
  shipping_cost: number  // ← Agregado
  total: number  // ← Agregado
  customer_notes?: string
  items: {
    product_id: string
    product_name: string
    product_slug: string
    product_image?: string
    base_price: number
    customization_details?: any
    engraving?: string
    quantity: number
    unit_price: number
    total_price: number
  }[]
}