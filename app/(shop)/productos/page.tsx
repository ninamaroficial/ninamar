import { Suspense } from "react"
import { getProducts, getCategories } from "@/lib/supabase/queries"
import Container from "@/components/ui/Container"
import ProductCard from "@/components/products/ProductCard"
import ProductsFilters from "@/components/products/ProductsFilters"
import styles from "./page.module.css"

export const metadata = {
  title: "Productos - Niñamar",
  description: "Explora nuestra colección de accesorios personalizables"
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


<section className={styles.hero}>
  <Container>
    <div className={styles.heroContent}>
      <h1 className={styles.heroTitle}>Colección</h1>
      <p className={styles.heroSubtitle}>
        accesorios únicos diseñados con amor
      </p>
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
              {/* Header con resultados */}
              {search && (
                <div className={styles.searchHeader}>
                  <p className={styles.searchInfo}>
                    Buscando <span className={styles.searchTerm}>"{search}"</span>
                  </p>
                </div>
              )}

              <div className={styles.resultsHeader}>
                <h2 className={styles.resultsTitle}>
                  {categorySlug
                    ? categories.find(c => c.slug === categorySlug)?.name || 'Productos'
                    : 'Todos los productos'
                  }
                </h2>
                <p className={styles.resultsCount}>
                  {products.length} {products.length === 1 ? 'pieza' : 'piezas'}
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
                  <div className={styles.emptyContent}>
                    <h3 className={styles.emptyTitle}>No se encontraron productos</h3>
                    <p className={styles.emptyText}>
                      {search
                        ? `Intenta buscar algo diferente`
                        : 'Ajusta los filtros para ver más productos'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}