import { NextRequest, NextResponse } from 'next/server'
import { 
  getValuesByOptionId,
  createCustomizationValue 
} from '@/lib/supabase/admin-customizations'
import { verifyAdminToken } from '@/lib/auth/admin'

// GET - Obtener valores de una opción
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
    const values = await getValuesByOptionId(optionId)
    
    return NextResponse.json(values)
  } catch (error) {
    console.error('Error fetching values:', error)
    return NextResponse.json(
      { error: 'Error al obtener valores' },
      { status: 500 }
    )
  }
}

// POST - Crear valor
export async function POST(
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

    if (!body.value || !body.display_name) {
      return NextResponse.json(
        { error: 'Valor y nombre a mostrar son requeridos' },
        { status: 400 }
      )
    }

    const value = await createCustomizationValue({
      ...body,
      option_id: optionId,
    })
    
    console.log('✅ Customization value created:', value.id)
    
    return NextResponse.json(value)
  } catch (error) {
    console.error('Error creating value:', error)
    return NextResponse.json(
      { error: 'Error al crear valor' },
      { status: 500 }
    )
  }
}