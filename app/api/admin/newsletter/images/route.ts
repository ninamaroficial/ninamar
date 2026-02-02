import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth/admin'
import { readdir, unlink, stat } from 'fs/promises'
import path from 'path'

// GET - Listar todas las imágenes guardadas
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

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'newsletter')
    
    try {
      const files = await readdir(uploadDir)
      
      // Filtrar solo imágenes y obtener información
      const imageFiles = await Promise.all(
        files
          .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
          .map(async (file) => {
            const filepath = path.join(uploadDir, file)
            const stats = await stat(filepath)
            
            return {
              filename: file,
              url: `/uploads/newsletter/${file}`,
              size: stats.size,
              createdAt: stats.birthtime,
            }
          })
      )

      // Ordenar por fecha de creación (más recientes primero)
      imageFiles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

      return NextResponse.json({ images: imageFiles })
    } catch (error) {
      // Si la carpeta no existe, retornar array vacío
      return NextResponse.json({ images: [] })
    }
  } catch (error) {
    console.error('Error listing images:', error)
    return NextResponse.json(
      { error: 'Error al listar imágenes' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar una imagen
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')

    if (!filename) {
      return NextResponse.json(
        { error: 'Nombre de archivo requerido' },
        { status: 400 }
      )
    }

    // Validar que el archivo esté en la carpeta correcta (seguridad)
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json(
        { error: 'Nombre de archivo inválido' },
        { status: 400 }
      )
    }

    const filepath = path.join(process.cwd(), 'public', 'uploads', 'newsletter', filename)
    
    try {
      await unlink(filepath)
      console.log('✅ Image deleted:', filename)
      return NextResponse.json({ message: 'Imagen eliminada correctamente' })
    } catch (error) {
      return NextResponse.json(
        { error: 'Imagen no encontrada' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { error: 'Error al eliminar imagen' },
      { status: 500 }
    )
  }
}
