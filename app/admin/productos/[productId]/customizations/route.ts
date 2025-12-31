import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth/admin'
import {
  getProductCustomizations,
  assignCustomizationToProduct
} from '@/lib/supabase/admin-customizations'

// GET - Obtener personalizaciones de un producto
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
    const customizations = await getProductCustomizations(productId)
    return NextResponse.json(customizations)
  } catch (error) {
    console.error('Error fetching product customizations:', error)
    return NextResponse.json(
      { error: 'Error al obtener personalizaciones del producto' },
      { status: 500 }
    )
  }
}

// POST - Asignar personalización a producto
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

    if (!body.option_id) {
      return NextResponse.json(
        { error: 'option_id es requerido' },
        { status: 400 }
      )
    }

    const customization = await assignCustomizationToProduct(
      productId,
      body.option_id,
      body.is_required ?? false,
      body.display_order ?? 0
    )

    console.log('✅ Customization assigned to product:', customization.id)
    return NextResponse.json(customization)
  } catch (error: any) {
    console.error('Error assigning customization:', error)
    return NextResponse.json(
      { error: error.message || 'Error al asignar personalización' },
      { status: 500 }
    )
  }
}