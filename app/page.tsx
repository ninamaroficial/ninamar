import HeroParallax from "@/components/home/HeroParallax"
import CustomizationShowcase from "@/components/home/CustomizationShowcase"
import ProductCategories from "@/components/home/ProductCategories"
import ProcessSteps from "@/components/home/ProcessSteps"
import Testimonials from "@/components/home/Testimonials"
import Container from "@/components/ui/Container"
import Button from "@/components/ui/Button"
import Link from "next/link"
import styles from "./page.module.css"

export default function Home() {
  return (
    <div>
      {/* Hero con Parallax */}
      <HeroParallax />

      {/* Showcase de Personalización */}
      <CustomizationShowcase />

      {/* Categorías de Productos */}
      <ProductCategories />

      {/* Proceso Paso a Paso */}
      <ProcessSteps />

      {/* Testimonios */}
      <Testimonials />

      {/* Call to Action Final */}
      <section className={styles.ctaSection}>
        <Container>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>¿Lista para Crear tu Joya Única?</h2>
            <p className={styles.ctaSubtitle}>
              Comienza a diseñar hoy y lleva contigo una pieza que cuente tu historia
            </p>
            <Link href="/productos">
              <Button size="lg" variant="primary" className={styles.ctaButton}>
                Comenzar a Diseñar
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </div>
  )
}