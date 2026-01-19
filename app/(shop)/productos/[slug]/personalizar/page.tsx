import { notFound } from "next/navigation"
import { getProductBySlug, getProductCustomizations } from "@/lib/supabase/queries"
import CustomizationPage from "@/components/products/CustomizationPage"
import type { Metadata } from "next"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const product = await getProductBySlug(decodedSlug)

  if (!product) {
    return {
      title: "Producto no encontrado",
    }
  }

  return {
    title: `Personaliza tu ${product.name} | Niñamar`,
    description: `Personaliza tu ${product.name} - ${product.short_description || 'Accesorios únicos hechos a mano'}`,
  }
}

export default async function PersonalizarProductoPage({ params }: PageProps) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const product = await getProductBySlug(decodedSlug)

  if (!product) {
    notFound()
  }

  const customizationOptionsRaw = await getProductCustomizations(product.id)
  const customizationOptions = customizationOptionsRaw.filter((opt): opt is NonNullable<typeof opt> => opt !== null)

  return (
    <CustomizationPage
      product={product}
      options={customizationOptions}
    />
  )
}
