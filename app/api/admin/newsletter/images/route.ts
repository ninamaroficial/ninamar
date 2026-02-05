import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth/admin'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

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

    // Listar archivos del bucket
    const { data: files, error } = await supabaseAdmin.storage
      .from('newsletter_images')
      .list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (error) {
      console.error('Error listing files:', error)
      return NextResponse.json({ images: [] })
    }

    // Mapear archivos a formato esperado
    const imageFiles = files
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name))
      .map(file => {
        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('newsletter_images')
          .getPublicUrl(file.name)

        return {
          filename: file.name,
          url: publicUrl,
          size: file.metadata?.size || 0,
          createdAt: file.created_at,
        }
      })

    return NextResponse.json({ images: imageFiles })
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

    // Eliminar de Supabase Storage
    const { error } = await supabaseAdmin.storage
      .from('newsletter_images')
      .remove([filename])

    if (error) {
      console.error('Error deleting file:', error)
      return NextResponse.json(
        { error: 'Error al eliminar imagen' },
        { status: 500 }
      )
    }

    console.log('✅ Image deleted:', filename)
    return NextResponse.json({ message: 'Imagen eliminada correctamente' })
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { error: 'Error al eliminar imagen' },
      { status: 500 }
    )
  }
}
