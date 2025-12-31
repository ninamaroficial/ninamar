import { NextRequest, NextResponse } from 'next/server'
import { 
  getAllCustomizationOptions, 
  createCustomizationOption 
} from '@/lib/supabase/admin-customizations'
import { verifyAdminToken } from '@/lib/auth/admin'

// GET - Obtener todas las opciones
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = verifyAdminToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const options = await getAllCustomizationOptions()
    return NextResponse.json(options)
  } catch (error) {
    console.error('Error fetching customization options:', error)
    return NextResponse.json(
      { error: 'Error al obtener opciones' },
      { status: 500 }
    )
  }
}

// POST - Crear opción
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = verifyAdminToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const body = await request.json()

    if (!body.name || !body.type || !body.display_name) {
      return NextResponse.json(
        { error: 'Nombre, tipo y nombre a mostrar son requeridos' },
        { status: 400 }
      )
    }

    const option = await createCustomizationOption(body)
    
    console.log('✅ Customization option created:', option.id)
    
    return NextResponse.json(option)
  } catch (error) {
    console.error('Error creating customization option:', error)
    return NextResponse.json(
      { error: 'Error al crear opción' },
      { status: 500 }
    )
  }
}