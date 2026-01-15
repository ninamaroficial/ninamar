import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { verifyAdminToken } from "@/lib/auth/admin"

type RouteContext = {
  params: Promise<{ categoryId: string }>
}

// GET - Obtener una categoría por ID
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const token = request.cookies.get("admin_token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const user = verifyAdminToken(token)
    if (!user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { categoryId } = await context.params
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", categoryId)
      .single()

    if (error) {
      console.error("Error fetching category:", error)
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json(
      { error: "Error al obtener categoría" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar una categoría
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const token = request.cookies.get("admin_token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const user = verifyAdminToken(token)
    if (!user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { categoryId } = await context.params
    const body = await request.json()
    const { name, slug, description, image_url } = body as {
      name?: string
      slug?: string
      description?: string | null
      image_url?: string | null
    }

    // Validaciones
    if (!name || !slug) {
      return NextResponse.json(
        { error: "Nombre y slug son requeridos" },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Verificar que el slug no exista en otra categoría
    // Nota: .single() puede devolver error cuando no hay filas; eso NO es un error para nosotros.
    const { data: existing, error: existingError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .neq("id", categoryId)
      .maybeSingle()

    if (existingError) {
      // Si aparece un error real de supabase, lo logueamos pero seguimos solo si no afecta
      console.error("Error checking existing slug:", existingError)
    }

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe otra categoría con ese slug" },
        { status: 400 }
      )
    }

    // Actualizar categoría
    const { data, error } = await supabase
      .from("categories")
      .update({
        name,
        slug,
        description: description ?? null,
        image_url: image_url ?? null,
      })
      .eq("id", categoryId)
      .select()
      .single()

    if (error) {
      console.error("Error updating category:", error)
      return NextResponse.json(
        { error: "Error al actualizar categoría" },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json(
      { error: "Error al actualizar categoría" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar una categoría
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const token = request.cookies.get("admin_token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const user = verifyAdminToken(token)
    if (!user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { categoryId } = await context.params
    const supabase = createAdminClient()

    // Verificar si hay productos asociados a esta categoría
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id")
      .eq("category_id", categoryId)
      .limit(1)

    if (productsError) {
      console.error("Error checking products for category:", productsError)
      return NextResponse.json(
        { error: "Error al validar productos asociados" },
        { status: 500 }
      )
    }

    if (products && products.length > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar una categoría que tiene productos asociados",
        },
        { status: 400 }
      )
    }

    // Eliminar categoría
    const { error } = await supabase.from("categories").delete().eq("id", categoryId)

    if (error) {
      console.error("Error deleting category:", error)
      return NextResponse.json(
        { error: "Error al eliminar categoría" },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: "Categoría eliminada exitosamente" })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json(
      { error: "Error al eliminar categoría" },
      { status: 500 }
    )
  }
}
