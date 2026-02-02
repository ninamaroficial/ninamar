import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth/admin'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
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

    // Obtener el archivo del form data
    const formData = await request.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 })
    }

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Tipo de archivo no válido. Solo se permiten imágenes (JPG, PNG, GIF, WEBP)' 
      }, { status: 400 })
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'El archivo es demasiado grande. Máximo 5MB' 
      }, { status: 400 })
    }

    // Convertir el archivo a buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop()
    const filename = `newsletter-${timestamp}-${randomString}.${extension}`

    // Crear directorio si no existe
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'newsletter')
    await mkdir(uploadDir, { recursive: true })

    // Guardar el archivo
    const filepath = path.join(uploadDir, filename)
    await writeFile(filepath, buffer)

    // Retornar la URL pública
    const publicUrl = `/uploads/newsletter/${filename}`

    console.log('✅ Image uploaded:', publicUrl)

    return NextResponse.json({ 
      url: publicUrl,
      filename,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: 'Error al subir la imagen' },
      { status: 500 }
    )
  }
}
