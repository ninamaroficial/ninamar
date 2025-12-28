import { createClient } from './server'
import type { Product, Category, ProductImage } from '@/types/database.types'

export type ProductWithDetails = Product & {
  category: Category | null
  images: ProductImage[]
  reviews_avg?: number
  reviews_count?: number
}

// Obtener todos los productos con sus relaciones
export async function getProducts(filters?: {
  categorySlug?: string
  featured?: boolean
  search?: string
  minPrice?: number
  maxPrice?: number
  limit?: number
}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      images:product_images(*)
    `)
    .eq('is_active', true)

  // Filtros
  if (filters?.categorySlug) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', filters.categorySlug)
      .single()
    
    if (category) {
      query = query.eq('category_id', category.id)
    }
  }

  if (filters?.featured) {
    query = query.eq('is_featured', true)
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,short_description.ilike.%${filters.search}%`)
  }

  if (filters?.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice)
  }

  if (filters?.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return data as ProductWithDetails[]
}

// Obtener un producto por slug
export async function getProductBySlug(slug: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      images:product_images(*),
      reviews(rating)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  // Calcular promedio de reviews
  const reviews = data.reviews || []
  const reviewsCount = reviews.length
  const reviewsAvg = reviewsCount > 0
    ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviewsCount
    : 0

  return {
    ...data,
    reviews_avg: reviewsAvg,
    reviews_count: reviewsCount
  } as ProductWithDetails & { reviews_avg: number; reviews_count: number }
}

// Obtener todas las categorías
export async function getCategories() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data as Category[]
}

// Obtener opciones de personalización para un producto
export async function getProductCustomizations(productId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('product_customizations')
    .select(`
      id,
      is_required,
      customization_options!inner(
        id,
        name,
        type,
        description
      )
    `)
    .eq('product_id', productId)

  if (error) {
    console.error('Error fetching customizations:', error)
    return []
  }

  if (!data || data.length === 0) {
    return []
  }

  // Ahora obtener los valores de cada opción
  const optionsWithValues = await Promise.all(
    data.map(async (item: any) => {
      const { data: values, error: valuesError } = await supabase
        .from('customization_values')
        .select('id, value, additional_price, hex_color, image_url')
        .eq('option_id', item.customization_options.id)

      if (valuesError) {
        console.error('Error fetching values:', valuesError)
        return null
      }

      return {
        id: item.customization_options.id,
        name: item.customization_options.name,
        type: item.customization_options.type,
        is_required: item.is_required,
        values: values || []
      }
    })
  )

  return optionsWithValues.filter(Boolean)
}


// Obtener productos destacados
export async function getFeaturedProducts(limit: number = 4) {
  return getProducts({ featured: true, limit })
}

