import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { createAdminClient } from '@/lib/supabase/admin'
import bcrypt from 'bcryptjs'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
)

export async function POST(request: NextRequest) {
  try {
    // Verificar que el admin esté autenticado
    const token = request.cookies.get('admin_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar token
    let payload
    try {
      const verified = await jwtVerify(token, JWT_SECRET)
      payload = verified.payload
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    const { currentPassword, newPassword } = await request.json()

    // Validaciones
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Obtener admin actual
    const { data: admin, error: fetchError } = await supabase
      .from('admins')
      .select('*')
      .eq('id', payload.adminId)
      .single()

    if (fetchError || !admin) {
      return NextResponse.json(
        { error: 'Admin no encontrado' },
        { status: 404 }
      )
    }

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(currentPassword, admin.password_hash)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'La contraseña actual es incorrecta' },
        { status: 401 }
      )
    }

    // Generar nuevo hash
    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    // Actualizar contraseña
    const { error: updateError } = await supabase
      .from('admins')
      .update({ password_hash: newPasswordHash })
      .eq('id', admin.id)

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json(
        { error: 'Error al actualizar la contraseña' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    )
  }
}