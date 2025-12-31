import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdminToken } from '@/lib/auth/admin'

// GET - Obtener todas las categorías
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const token = request.cookies.get('admin_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = verifyAdminToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // CAMBIO: Quitar is_active porque no existe en la tabla
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, description, image_url')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Error al obtener categorías' },
      { status: 500 }
    )
  }
}