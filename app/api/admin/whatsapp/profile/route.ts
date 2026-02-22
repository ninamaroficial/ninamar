import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth/admin'
import { getBusinessProfile, updateBusinessProfile, uploadBusinessProfilePicture } from '@/lib/whatsapp/client'

// GET - Obtener perfil actual del bot de WhatsApp
export async function GET(request: NextRequest) {
  try {
    const adminToken = request.cookies.get('admin-token')?.value
    
    if (!adminToken) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    const isValid = await verifyAdminToken(adminToken)
    
    if (!isValid) {
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
    const adminToken = request.cookies.get('admin-token')?.value
    
    if (!adminToken) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    const isValid = await verifyAdminToken(adminToken)
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { about, description, email, websites, profilePictureUrl } = body

    // Actualizar texto del perfil
    if (about || description || email || websites) {
      await updateBusinessProfile({
        about,
        description,
        email,
        websites: websites ? [websites] : undefined,
        vertical: 'RETAIL',
      })
    }

    // Actualizar foto de perfil si se proporcionó
    if (profilePictureUrl) {
      await uploadBusinessProfilePicture(profilePictureUrl)
    }

    return NextResponse.json({ 
      success: true,
      message: 'Perfil actualizado correctamente'
    })
  } catch (error) {
    console.error('Error actualizando perfil de WhatsApp:', error)
    return NextResponse.json(
      { error: 'Error al actualizar perfil' },
      { status: 500 }
    )
  }
}
