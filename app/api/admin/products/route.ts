import { NextRequest, NextResponse } from 'next/server'
import { getAllProducts, createProduct, generateUniqueSlug } from '@/lib/supabase/admin-products'
import { verifyAdminToken } from '@/lib/auth/admin'

// GET - Obtener todos los productos
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

    const products = await getAllProducts()
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    )
  }
}

// POST - Crear producto
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

    const body = await request.json()

    // Validaciones
    if (!body.name || !body.base_price) {
      return NextResponse.json(
        { error: 'Nombre y precio son requeridos' },
        { status: 400 }
      )
    }

    // Generar slug si no viene
    if (!body.slug) {
      body.slug = await generateUniqueSlug(body.name)
    }

    const product = await createProduct(body)
    
    console.log('✅ Product created:', product.id)
    
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Error al crear producto' },
      { status: 500 }
    )
  }
}