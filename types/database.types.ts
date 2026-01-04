export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          short_description: string | null
          price: number
          base_price: number
          original_price: number | null
          stock: number
          category_id: string | null  // ← Mantener (es útil para filtrar por categoría)
          is_featured: boolean
          sku: string  // ← Ya no nullable, siempre se genera automáticamente
          image_url: string | null
          created_at: string
          updated_at: string
        }
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          image_url: string
          alt_text: string | null
          is_primary: boolean
          display_order: number
          created_at: string
        }
      }
      customization_options: {
        Row: {
          id: string
          name: string
          type: string
          display_name: string
          description: string | null
          is_required: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
      }
      customization_values: {
        Row: {
          id: string
          option_id: string
          value: string
          display_name: string
          additional_price: number
          hex_color: string | null
          image_url: string | null
          is_available: boolean
          display_order: number
          created_at: string
        }
      }
      product_customizations: {
        Row: {
          id: string
          product_id: string
          option_id: string
          is_required: boolean
          display_order: number
          created_at: string
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_name: string
          user_email: string | null
          rating: number
          title: string | null
          comment: string | null
          is_verified: boolean
          is_approved: boolean
          created_at: string
        }
      }
    }
  }
}

export interface Shipment {
  id: string
  order_id: string
  carrier: string
  tracking_number: string
  shipping_date: string
  estimated_delivery_date?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface CreateShipmentData {
  order_id: string
  carrier: string
  tracking_number: string
  shipping_date?: string
  estimated_delivery_date?: string | null
  notes?: string | null
}

// Proveedores de envío comunes en Colombia
export const SHIPPING_CARRIERS = [
  'Servientrega',
  'Coordinadora',
  'Deprisa',
  'Envía',
  'InterRapidísimo',
  'TCC',
  'Mensajeros Urbanos',
  '99 Minutos',
  'Otro'
] as const

export type ShippingCarrier = typeof SHIPPING_CARRIERS[number]
export type Product = Database['public']['Tables']['products']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type ProductImage = Database['public']['Tables']['product_images']['Row']
export type CustomizationOption = Database['public']['Tables']['customization_options']['Row']
export type CustomizationValue = Database['public']['Tables']['customization_values']['Row']
export type ProductCustomization = Database['public']['Tables']['product_customizations']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']