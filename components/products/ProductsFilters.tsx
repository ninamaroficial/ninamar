"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { X, Filter } from "lucide-react"
import type { Category } from "@/types/database.types"
import styles from "./ProductsFilters.module.css"

interface ProductsFiltersProps {
  categories: Category[]
}

export default function ProductsFilters({ categories }: ProductsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('categoria')
  const [isOpen, setIsOpen] = useState(false)
  
  const [priceRange, setPriceRange] = useState({
    min: '',
    max: ''
  })

  const handleCategoryClick = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (currentCategory === slug) {
      params.delete('categoria')
    } else {
      params.set('categoria', slug)
    }
    
    router.push(`/productos?${params.toString()}`)
  }

  const handlePriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (priceRange.min) {
      params.set('min', priceRange.min)
    } else {
      params.delete('min')
    }
    
    if (priceRange.max) {
      params.set('max', priceRange.max)
    } else {
      params.delete('max')
    }
    
    router.push(`/productos?${params.toString()}`)
    setIsOpen(false) // Cerrar en móvil después de aplicar
  }

  const handlePriceRangeClick = (min: string, max: string) => {
    setPriceRange({ min, max })
    const params = new URLSearchParams(searchParams.toString())
    if (min) params.set('min', min)
    if (max) params.set('max', max)
    else params.delete('max')
    router.push(`/productos?${params.toString()}`)
    setIsOpen(false) // Cerrar en móvil después de aplicar
  }

  const clearFilters = () => {
    setPriceRange({ min: '', max: '' })
    router.push('/productos')
    setIsOpen(false)
  }

  const hasActiveFilters = currentCategory || priceRange.min || priceRange.max

  return (
    <>
      {/* Botón flotante para móvil */}
      <button 
        onClick={() => setIsOpen(true)}
        className={styles.mobileFilterButton}
        aria-label="Abrir filtros"
      >
        <Filter size={20} />
        <span>Filtros</span>
        {hasActiveFilters && <span className={styles.filterBadge}></span>}
      </button>

      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Panel de filtros */}
      <div className={`${styles.filters} ${isOpen ? styles.filtersOpen : ''}`}>
        {/* Botón de cerrar para móvil */}
        <button 
          onClick={() => setIsOpen(false)}
          className={styles.mobileCloseButton}
          aria-label="Cerrar filtros"
        >
          <X size={24} />
        </button>

        <div className={styles.header}>
          <h3 className={styles.title}>Filtros</h3>
          {hasActiveFilters && (
            <button onClick={clearFilters} className={styles.clearButton}>
              Limpiar
            </button>
          )}
        </div>

        {/* Categorías */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Categorías</h4>
          <div className={styles.categoryList}>
            <button
              onClick={() => {
                router.push('/productos')
                setIsOpen(false)
              }}
              className={`${styles.categoryItem} ${!currentCategory ? styles.categoryItemActive : ''}`}
            >
              <span className={styles.categoryIcon}>✨</span>
              <span className={styles.categoryName}>Todas</span>
            </button>
            
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  handleCategoryClick(category.slug)
                  setIsOpen(false)
                }}
                className={`${styles.categoryItem} ${
                  currentCategory === category.slug ? styles.categoryItemActive : ''
                }`}
              >
                <span className={styles.categoryIcon}>💎</span>
                <span className={styles.categoryName}>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Rango de Precio */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Precio</h4>
          <div className={styles.priceInputs}>
            <input
              type="number"
              placeholder="Mínimo"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              className={styles.priceInput}
            />
            <span className={styles.priceSeparator}>-</span>
            <input
              type="number"
              placeholder="Máximo"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
              className={styles.priceInput}
            />
          </div>
          <button onClick={handlePriceFilter} className={styles.applyButton}>
            Aplicar
          </button>
        </div>

        {/* Rangos de precio predefinidos */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Rangos Populares</h4>
          <div className={styles.priceRanges}>
            <button 
              onClick={() => handlePriceRangeClick('0', '30000')}
              className={styles.priceRangeButton}
            >
              Menos de $30.000
            </button>
            <button 
              onClick={() => handlePriceRangeClick('30000', '50000')}
              className={styles.priceRangeButton}
            >
              $30.000 - $50.000
            </button>
            <button 
              onClick={() => handlePriceRangeClick('50000', '70000')}
              className={styles.priceRangeButton}
            >
              $50.000 - $70.000
            </button>
            <button 
              onClick={() => handlePriceRangeClick('70000', '')}
              className={styles.priceRangeButton}
            >
              Más de $70.000
            </button>
          </div>
        </div>

        {/* Información adicional */}
        <div className={styles.infoBox}>
          <span className={styles.infoIcon}>✨</span>
          <p className={styles.infoText}>
            Todos nuestros productos son personalizables. ¡Crea tu diseño único!
          </p>
        </div>
      </div>
    </>
  )
}