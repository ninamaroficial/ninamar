import { NextResponse } from 'next/server'
import { verifyAdminAccess } from '@/lib/auth/admin'
import { getAllReviews, getReviewsStats } from '@/lib/supabase/reviews'

export async function GET(request: Request) {
  try {
    // Verificar que el usuario es admin
    const admin = await verifyAdminAccess()
    if (!admin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
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
