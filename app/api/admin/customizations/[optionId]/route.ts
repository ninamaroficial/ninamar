import { NextRequest, NextResponse } from 'next/server'
import { 
  getCustomizationOptionById,
  updateCustomizationOption, 
  deleteCustomizationOption 
} from '@/lib/supabase/admin-customizations'
import { verifyAdminToken } from '@/lib/auth/admin'

// GET - Obtener opción por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ optionId: string }> }
) {
  try {
    const token = request.cookies.get('admin_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = verifyAdminToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const { optionId } = await params
    const option = await getCustomizationOptionById(optionId)
    
    return NextResponse.json(option)
  } catch (error) {
    console.error('Error fetching option:', error)
    return NextResponse.json(
      { error: 'Error al obtener opción' },
      { status: 500 }
    )
  }
}

// PATCH - Actualizar opción
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ optionId: string }> }
) {
  try {
    const token = request.cookies.get('admin_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = verifyAdminToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const { optionId } = await params
    const body = await request.json()
    
    const option = await updateCustomizationOption(optionId, body)
    
    console.log('✅ Customization option updated:', option.id)
    
    return NextResponse.json(option)
  } catch (error) {
    console.error('Error updating option:', error)
    return NextResponse.json(
      { error: 'Error al actualizar opción' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar opción
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ optionId: string }> }
) {
  try {
    const token = request.cookies.get('admin_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = verifyAdminToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const { optionId } = await params
    await deleteCustomizationOption(optionId)
    
    console.log('✅ Customization option deleted:', optionId)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting option:', error)
    return NextResponse.json(
      { error: 'Error al eliminar opción' },
      { status: 500 }
    )
  }
}