import { Suspense } from "react"
import { getProducts, getCategories } from "@/lib/supabase/queries"
import Container from "@/components/ui/Container"
import ProductCard from "@/components/products/ProductCard"
import ProductsFilters from "@/components/products/ProductsFilters"
import styles from "./page.module.css"

export const metadata = {
  title: "Productos - Niñamar",
  description: "Explora nuestra colección de joyas personalizables"
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const categorySlug = typeof params.categoria === 'string' ? params.categoria : undefined
  const search = typeof params.buscar === 'string' ? params.buscar : undefined
  const minPrice = typeof params.min === 'string' ? parseFloat(params.min) : undefined
  const maxPrice = typeof params.max === 'string' ? parseFloat(params.max) : undefined

  const [products, categories] = await Promise.all([
    getProducts({ categorySlug, search, minPrice, maxPrice }),
    getCategories()
  ])

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <Container>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Nuestra Colección</h1>
            <p className={styles.heroSubtitle}>
              Descubre joyas únicas diseñadas especialmente para ti
            </p>
            {search && (
              <p className={styles.searchInfo}>
                Resultados para: <strong>"{search}"</strong>
              </p>
            )}
          </div>
        </Container>
      </section>

      {/* Products Section */}
      <section className={styles.productsSection}>
        <Container>
          <div className={styles.layout}>
            {/* Sidebar con filtros */}
            <aside className={styles.sidebar}>
              <ProductsFilters categories={categories} />
            </aside>

            {/* Grid de productos */}
            <div className={styles.mainContent}>
              <div className={styles.resultsHeader}>
                <p className={styles.resultsCount}>
                  {products.length} {products.length === 1 ? 'producto encontrado' : 'productos encontrados'}
                </p>
              </div>

              {products.length > 0 ? (
                <div className={styles.productsGrid}>
                  {products.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>🔍</span>
                  <h3 className={styles.emptyTitle}>No encontramos productos</h3>
                  <p className={styles.emptyText}>
                    {search 
                      ? `No hay resultados para "${search}". Intenta con otros términos.`
                      : 'Intenta ajustar los filtros o realiza una búsqueda diferente'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}