"use client"

import Link from "next/link"
import { ShoppingCart, Menu, Search, X } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/context/CartContext"
import styles from "./navbar.module.css"

export default function Navbar() {
  const router = useRouter()
  const { totalItems, openCart } = useCart() // ← Agregar useCart
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const navigation = [
    { name: "Inicio", href: "/" },
    { name: "Productos", href: "/productos" },
    { name: "Contacto", href: "/contacto" },
  ]

  // Prevenir scroll cuando el menú está abierto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/productos?buscar=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
      setIsMenuOpen(false)
    }
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.navContent}>
        {/* Desktop Navigation */}
        <div className={styles.desktopNav}>
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={styles.navLink}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Search Bar - Desktop */}
        <div className={styles.searchContainer}>
          <form onSubmit={handleSearch} className={styles.searchWrapper}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </form>
        </div>

        {/* Right Icons */}
        <div className={styles.iconButtons}>
          {/* Botón del carrito */}
          <button 
            onClick={openCart}
            className={styles.iconButton} 
            aria-label="Carrito de compras"
          >
            <ShoppingCart className="h-6 w-6" />
            {totalItems > 0 && (
              <span className={styles.cartBadge}>{totalItems}</span>
            )}
          </button>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`${styles.mobileMenuButton} ${isMenuOpen ? styles.open : ''}`}
            aria-label="Menú"
          >
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation - Fullscreen */}
      <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`}>
        {/* Botón de cerrar */}
        <button
          onClick={() => setIsMenuOpen(false)}
          className={styles.closeButton}
          aria-label="Cerrar menú"
        >
          <X className={styles.closeIcon} />
        </button>

        {/* Barra de búsqueda móvil */}
        <form onSubmit={handleSearch} className={styles.mobileSearchWrapper}>
          <Search className={styles.mobileSearchIcon} />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.mobileSearchInput}
          />
        </form>

        {/* Enlaces de navegación */}
        <div className={styles.mobileMenuContent}>
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={styles.mobileMenuLink}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          
          {/* Botón de carrito en móvil */}
          <button
            onClick={() => {
              setIsMenuOpen(false)
              openCart()
            }}
            className={styles.mobileCartButton}
          >
            <ShoppingCart size={24} />
            <span>Ver Carrito</span>
            {totalItems > 0 && (
              <span className={styles.mobileCartBadge}>{totalItems}</span>
            )}
          </button>
        </div>

        {/* Decoración */}
        <div className={styles.menuDecoration}>🌊</div>
      </div>
    </nav>
  )
}