import { createAdminClient } from './admin'

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  base_price: number
  original_price: number | null
  image_url: string | null
  category_id: string | null
  stock: number
  sku: string  // ← Ya no nullable
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateProductData {
  name: string
  slug?: string
  description?: string
  short_description?: string
  base_price: number
  original_price?: number
  image_url?: string
  category_id?: string
  stock?: number
  // sku se genera automáticamente, no lo incluimos
  is_featured?: boolean
  is_active?: boolean
}

export interface UpdateProductData extends Partial<CreateProductData> {}

// Obtener todos los productos
export async function getAllProducts() {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching products:', error)
    throw error
  }
  
  return data as Product[]
}

// Obtener un producto por ID
export async function getProductById(productId: string) {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single()
  
  if (error) {
    console.error('Error fetching product:', error)
    throw error
  }
  
  return data as Product
}

// Crear producto
export async function createProduct(productData: CreateProductData) {
  const supabase = createAdminClient()
  
  // Asegurar que price y base_price tengan el mismo valor
  const dataToInsert = {
    ...productData,
    price: productData.base_price,
    base_price: productData.base_price,
    // SKU se genera automáticamente por el trigger
  }
  
  const { data, error } = await supabase
    .from('products')
    .insert(dataToInsert)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating product:', error)
    throw error
  }
  
  return data as Product
}
// Actualizar producto
export async function updateProduct(productId: string, productData: UpdateProductData) {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('products')
    .update(productData)
    .eq('id', productId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating product:', error)
    throw error
  }
  
  return data as Product
}

// Eliminar producto
export async function deleteProduct(productId: string) {
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
  
  if (error) {
    console.error('Error deleting product:', error)
    throw error
  }
  
  return true
}

// Generar slug único
export async function generateUniqueSlug(name: string): Promise<string> {
  const supabase = createAdminClient()
  
  // Convertir nombre a slug
  let slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9]+/g, '-') // Reemplazar espacios y caracteres especiales
    .replace(/^-+|-+$/g, '') // Quitar guiones al inicio y final
  
  // Verificar si existe
  const { data } = await supabase
    .from('products')
    .select('slug')
    .eq('slug', slug)
    .maybeSingle()
  
  // Si existe, agregar número
  if (data) {
    let counter = 1
    let newSlug = `${slug}-${counter}`
    
    while (true) {
      const { data: existing } = await supabase
        .from('products')
        .select('slug')
        .eq('slug', newSlug)
        .maybeSingle()
      
      if (!existing) {
        slug = newSlug
        break
      }
      
      counter++
      newSlug = `${slug}-${counter}`
      
      // Evitar loop infinito
      if (counter > 100) {
        slug = `${slug}-${Date.now()}`
        break
      }
    }
  }
  
  return slug
}