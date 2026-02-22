/**
 * WhatsApp Bot - Catalog Functions
 * Funciones para consultar productos y categorías desde Supabase
 */

import { createAdminClient } from '@/lib/supabase/admin'

interface WhatsAppProduct {
  id: string
  name: string
  slug: string
  price: number
  description: string | null
  short_description: string | null
  image_url: string | null
  category_name?: string
}

interface WhatsAppCategory {
  id: string
  name: string
  slug: string
  description: string | null
}

/** Obtener todas las categorías activas */
export async function getCategoriesForWhatsApp(): Promise<WhatsAppCategory[]> {
  const supabase = createAdminClient()
  
  // Primero intentar con is_active = true
  let { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, description')
    .eq('is_active', true)
    .order('name')
  
  // Si no hay resultados, traer todas las categorías sin filtro
  if (!data || data.length === 0) {
    const result = await supabase
      .from('categories')
      .select('id, name, slug, description')
      .order('name')
    
    data = result.data
    error = result.error
  }
  
  if (error) {
    console.error('Error fetching categories for WhatsApp:', error)
    return []
  }
  
  return data || []
}

/** Obtener productos (máx. 30 para WhatsApp) */
export async function getProductsForWhatsApp(): Promise<WhatsAppProduct[]> {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      id, name, slug, price, base_price, description, short_description, image_url,
      category:categories(name)
    `)
    .eq('is_active', true)
    .gt('stock', 0)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(30)
  
  if (error) {
    console.error('Error fetching products for WhatsApp:', error)
    return []
  }
  
  return (data || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price ?? p.base_price ?? 0,
    description: p.description,
    short_description: p.short_description,
    image_url: p.image_url,
    category_name: p.category?.name,
  }))
}

/** Obtener productos de una categoría */
export async function getProductsByCategory(categoryId: string): Promise<WhatsAppProduct[]> {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      id, name, slug, price, base_price, description, short_description, image_url,
      category:categories(name)
    `)
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .gt('stock', 0)
    .order('created_at', { ascending: false })
    .limit(10)
  
  if (error) {
    console.error('Error fetching products by category:', error)
    return []
  }
  
  return (data || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price ?? p.base_price ?? 0,
    description: p.description,
    short_description: p.short_description,
    image_url: p.image_url,
    category_name: p.category?.name,
  }))
}

/** Formatear detalle de un producto para WhatsApp */
export async function formatProductDetail(productId: string) {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      id, name, slug, price, base_price, original_price, description, short_description, image_url, stock,
      category:categories(name),
      images:product_images(image_url, alt_text, is_primary)
    `)
    .eq('id', productId)
    .single()
  
  if (error || !data) {
    return null
  }
  
  const price = data.price ?? (data as any).base_price ?? 0
  const originalPrice = data.original_price
  
  let text = `✨ *${data.name}*\n\n`
  
  if (data.short_description) {
    text += `${data.short_description}\n\n`
  } else if (data.description) {
    text += `${data.description.slice(0, 200)}${data.description.length > 200 ? '...' : ''}\n\n`
  }
  
  text += `💰 *Precio: $${price.toLocaleString('es-CO')}*`
  if (originalPrice && originalPrice > price) {
    text += ` ~$${originalPrice.toLocaleString('es-CO')}~`
  }
  text += '\n'
  
  if ((data as any).category?.name) {
    text += `🏷️ Categoría: ${(data as any).category.name}\n`
  }
  
  text += `📦 Stock: ${data.stock > 0 ? 'Disponible' : 'Agotado'}\n`
  
  // Recopilar todas las imágenes del producto
  const allImages: string[] = []
  
  // Primero la imagen principal (si existe)
  const primaryImage = (data as any).images?.find((img: any) => img.is_primary)
  if (primaryImage?.image_url) {
    allImages.push(primaryImage.image_url)
  } else if (data.image_url) {
    allImages.push(data.image_url)
  }
  
  // Luego las demás imágenes (máx 10 imágenes por producto)
  const otherImages = (data as any).images?.filter((img: any) => !img.is_primary) || []
  otherImages.slice(0, 9).forEach((img: any) => {
    if (img.image_url && !allImages.includes(img.image_url)) {
      allImages.push(img.image_url)
    }
  })
  
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    price,
    images: allImages,
    text,
  }
}
