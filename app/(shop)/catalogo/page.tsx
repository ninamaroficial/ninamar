import type { Metadata } from 'next'
import Container from '@/components/ui/Container'
import CatalogLoader from '@/components/catalog/CatalogLoader'
import { BookOpen } from 'lucide-react'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Catálogo - Niñamar | Accesorios Personalizados',
  description: 'Explora nuestro catálogo interactivo de accesorios personalizados hechos a mano. Descubre collares, pulseras, aretes y más en Niñamar.',
  openGraph: {
    title: 'Catálogo Interactivo - Niñamar',
    description: 'Explora nuestro catálogo de accesorios únicos y personalizados hechos a mano en Popayán, Colombia.',
    url: 'https://niñamar.com/catalogo',
  },
}

export default function CatalogoPage() {
  return (
    <div className={styles.page}>


      <section className={styles.catalogSection}>
        <CatalogLoader pdfUrl="/catalogo/Catalogo2.pdf" />
      </section>
    </div>
  )
}
