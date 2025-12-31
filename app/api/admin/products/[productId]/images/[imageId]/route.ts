import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdminToken } from '@/lib/auth/admin'

// PATCH - Actualizar imagen
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string; imageId: string }> }
) {
  try {
    const token = request.cookies.get('admin_token')?.value
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { imageId, productId } = await params
    const body = await request.json()
    const supabase = createAdminClient()

    // Si se está marcando como primaria, desmarcar las demás
    if (body.is_primary === true) {
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', productId)
    }

    const { data, error } = await supabase
      .from('product_images')
      .update(body)
      .eq('id', imageId)
      .select()
      .single()

    if (error) throw error

    console.log('✅ Image updated:', imageId)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating image:', error)
    return NextResponse.json({ error: 'Error al actualizar imagen' }, { status: 500 })
  }
}

// DELETE - Eliminar imagen
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string; imageId: string }> }
) {
  try {
    const token = request.cookies.get('admin_token')?.value
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { imageId, productId } = await params
    const supabase = createAdminClient()

    // Verificar si es la imagen primaria
    const { data: imageToDelete } = await supabase
      .from('product_images')
      .select('is_primary')
      .eq('id', imageId)
      .single()

    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId)

    if (error) throw error

    // Si era la primaria, hacer primaria la siguiente
    if (imageToDelete?.is_primary) {
      const { data: nextImage } = await supabase
        .from('product_images')
        .select('id')
        .eq('product_id', productId)
        .order('display_order', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (nextImage) {
        await supabase
          .from('product_images')
          .update({ is_primary: true })
          .eq('id', nextImage.id)
      }
    }

    console.log('✅ Image deleted:', imageId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json({ error: 'Error al eliminar imagen' }, { status: 500 })
  }
}