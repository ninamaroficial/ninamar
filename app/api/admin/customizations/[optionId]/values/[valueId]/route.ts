import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth/admin'
import {
  updateCustomizationValue,
  deleteCustomizationValue
} from '@/lib/supabase/admin-customizations'

// PATCH - Actualizar valor
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ optionId: string; valueId: string }> }
) {
  try {
    const token = request.cookies.get('admin_token')?.value
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { valueId } = await params
    const body = await request.json()

    const value = await updateCustomizationValue(valueId, body)
    console.log('✅ Customization value updated:', valueId)
    return NextResponse.json(value)
  } catch (error) {
    console.error('Error updating value:', error)
    return NextResponse.json(
      { error: 'Error al actualizar valor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar valor
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ optionId: string; valueId: string }> }
) {
  try {
    const token = request.cookies.get('admin_token')?.value
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { valueId } = await params
    await deleteCustomizationValue(valueId)
    console.log('✅ Customization value deleted:', valueId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting value:', error)
    return NextResponse.json(
      { error: 'Error al eliminar valor' },
      { status: 500 }
    )
  }
}