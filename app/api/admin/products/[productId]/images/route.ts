import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdminToken } from '@/lib/auth/admin'

// GET - Obtener todas las imágenes de un producto
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const token = request.cookies.get('admin_token')?.value
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { productId } = await params
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('display_order', { ascending: true })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching images:', error)
    return NextResponse.json({ error: 'Error al obtener imágenes' }, { status: 500 })
  }
}

// POST - Agregar nueva imagen
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const token = request.cookies.get('admin_token')?.value
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { productId } = await params
    const body = await request.json()

    if (!body.image_url) {
      return NextResponse.json({ error: 'URL de imagen requerida' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Obtener el siguiente display_order
    const { data: existingImages } = await supabase
      .from('product_images')
      .select('display_order')
      .eq('product_id', productId)
      .order('display_order', { ascending: false })
      .limit(1)

    const nextOrder = existingImages && existingImages.length > 0 
      ? existingImages[0].display_order + 1 
      : 0

    // Si es la primera imagen, hacerla primaria
    const { count } = await supabase
      .from('product_images')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId)

    const isPrimary = count === 0

    const { data, error } = await supabase
      .from('product_images')
      .insert({
        product_id: productId,
        image_url: body.image_url,
        alt_text: body.alt_text || null,
        is_primary: isPrimary,
        display_order: nextOrder,
      })
      .select()
      .single()

    if (error) throw error

    console.log('✅ Image added:', data.id)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error adding image:', error)
    return NextResponse.json({ error: 'Error al agregar imagen' }, { status: 500 })
  }
}