import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth/admin'
import { downloadMedia } from '@/lib/whatsapp/client'

// GET /api/admin/whatsapp/media/[mediaId]
// Devuelve el archivo de media (imagen/documento) para el panel admin
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  try {
    const token = request.cookies.get('admin_token')?.value
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { mediaId } = await params
    const media = await downloadMedia(mediaId)

    return new NextResponse(media.buffer, {
      status: 200,
      headers: {
        'Content-Type': media.mimeType,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Error fetching WhatsApp media:', error)
    return NextResponse.json(
      { error: 'Error al obtener media' },
      { status: 500 }
    )
  }
}
