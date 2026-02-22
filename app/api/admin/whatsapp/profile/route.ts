import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth/admin'
import { getBusinessProfile, updateBusinessProfile } from '@/lib/whatsapp/client'

// GET - Obtener perfil actual del bot de WhatsApp
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value
    
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const profile = await getBusinessProfile()
    
    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error obteniendo perfil de WhatsApp:', error)
    return NextResponse.json(
      { error: 'Error al obtener perfil' },
      { status: 500 }
    )
  }
}

// POST - Actualizar perfil del bot de WhatsApp
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value
    
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { about, description, email, websites, profilePictureUrl } = body

    // Actualizar texto del perfil
    await updateBusinessProfile({
      about,
      description,
      email,
      websites: websites ? [websites] : undefined,
      vertical: 'RETAIL',
    })

    // Nota: La foto de perfil debe cambiarse manualmente desde:
    // https://business.facebook.com/wa/manage/phone-numbers/
    // WhatsApp no permite subir fotos vía URL directamente

    return NextResponse.json({ 
      success: true,
      message: 'Perfil actualizado correctamente. Para cambiar la foto de perfil, ve a Facebook Business Manager.',
      profilePictureNote: 'La foto debe actualizarse manualmente en https://business.facebook.com/wa/manage/phone-numbers/'
    })
  } catch (error) {
    console.error('Error actualizando perfil de WhatsApp:', error)
    return NextResponse.json(
      { error: 'Error al actualizar perfil' },
      { status: 500 }
    )
  }
}
