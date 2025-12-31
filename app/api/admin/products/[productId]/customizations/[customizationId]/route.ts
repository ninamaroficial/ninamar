import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth/admin'
import { removeCustomizationFromProduct } from '@/lib/supabase/admin-customizations'

// DELETE - Remover personalización de producto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string; customizationId: string }> }
) {
  try {
    const token = request.cookies.get('admin_token')?.value
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { productId, customizationId } = await params
    await removeCustomizationFromProduct(productId, customizationId)
    console.log('✅ Customization removed from product:', customizationId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing customization:', error)
    return NextResponse.json(
      { error: 'Error al remover personalización' },
      { status: 500 }
    )
  }
}

// PATCH - Actualizar personalización en producto (is_required, display_order)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string; customizationId: string }> }
) {
  try {
    const token = request.cookies.get('admin_token')?.value
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { customizationId } = await params
    const body = await request.json()
    
    const { createAdminClient } = require('@/lib/supabase/admin')
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('product_customizations')
      .update(body)
      .eq('id', customizationId)
      .select()
      .single()

    if (error) throw error

    console.log('✅ Product customization updated:', customizationId)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating product customization:', error)
    return NextResponse.json(
      { error: 'Error al actualizar personalización' },
      { status: 500 }
    )
  }
}

