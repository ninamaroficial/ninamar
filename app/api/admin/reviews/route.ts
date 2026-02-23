import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth/admin'
import { getAllReviews, getReviewsStats } from '@/lib/supabase/reviews'

export async function GET(request: NextRequest) {
  try {
    // Verificar que el usuario es admin
    const token = request.cookies.get('admin_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = verifyAdminToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const stats = url.searchParams.get('stats') === 'true'

    if (stats) {
      // Retornar solo estadísticas
      const reviewsStats = await getReviewsStats()
      return NextResponse.json(reviewsStats)
    }

    // Retornar reviews paginadas
    const offset = (page - 1) * limit
    const { reviews, total } = await getAllReviews(limit, offset)

    return NextResponse.json({
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Error al obtener encuestas' },
      { status: 500 }
    )
  }
}
