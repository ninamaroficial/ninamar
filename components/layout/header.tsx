"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ShoppingCart, Package, Menu, X, ChevronDown, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import { useCart } from "@/lib/context/CartContext"
import styles from "./header.module.css"
import Image from "next/image"

type TransitionPhase = "idle" | "enter" | "exit"

interface Category {
  id: string
  name: string
  slug: string
}

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { totalItems, openCart } = useCart()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [transitionPhase, setTransitionPhase] = useState<TransitionPhase>("idle")
  const [categories, setCategories] = useState<Category[]>([])
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false) // Para móvil
  const [showDropdown, setShowDropdown] = useState(false) // Para desktop
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null)

  const navigation = [
    { name: "Inicio", href: "/" },
    { name: "Productos", href: "/productos", hasDropdown: true },
    { name: "Seguimiento", href: "/seguimiento" },
    { name: "Acerca de Niñamar", href: "/acerca" },
    { name: "Contacto", href: "/contacto" },
  ]

  // Cargar categorías
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchCategories()
  }, [])

  const navigateWithTransition = (href: string) => {
    if (href === pathname) {
      setIsMenuOpen(false)
      setShowDropdown(false)
      return
    }

    setTransitionPhase("enter")
    setIsMenuOpen(false)
    setShowDropdown(false)

    window.setTimeout(() => {
      router.push(href)
    }, 420)
  }

  useEffect(() => {
    if (transitionPhase === "enter") {
      setTransitionPhase("exit")
      window.setTimeout(() => setTransitionPhase("idle"), 420)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMenuOpen])

  // Funciones para manejar el dropdown con delay
  const handleMouseEnter = () => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout)
      setDropdownTimeout(null)
    }
    setShowDropdown(true)
  }

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowDropdown(false)
    }, 200) // 200ms de delay antes de ocultar
    setDropdownTimeout(timeout)
  }

  return (
    <>
      {/* Page transition overlay */}
      <div
        className={`${styles.pageTransition} ${
          transitionPhase === "enter" ? styles.pageTransitionEnter : ""
        } ${transitionPhase === "exit" ? styles.pageTransitionExit : ""}`}
      />

      {/* Top loader */}
      <div
        className={`${styles.topLoader} ${
          transitionPhase === "enter" ? styles.topLoaderOn : ""
        } ${transitionPhase === "exit" ? styles.topLoaderOff : ""}`}
      />

      {/* Promotional Banner */}
      <div className={styles.banner}>
        <div className={styles.bannerContent}>
          <Package size={16} className={styles.bannerIcon} />
          <p className={styles.bannerText}>
            ✨ Envío <strong>GRATIS</strong> en compras superiores a{" "}
            <strong>$100.000</strong> a toda Colombia
          </p>
        </div>
      </div>

      {/* Main Header */}
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}>
        <div className={styles.headerContent}>
          {/* Logo */}
          <Link
            href="/"
            className={styles.logo}
            onClick={(e) => {
              e.preventDefault()
              navigateWithTransition("/")
            }}
          >
            <div className={styles.logoImage}>
              <Image
                src="/logo.png"
                alt="Niñamar"
                width={80}
                height={80}
                className={styles.logoImg}
                priority
              />
            </div>
            <span className={styles.logoText}>Niñamar</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.desktopNav}>
            {navigation.map((item) => {
              if (item.hasDropdown) {
                return (
                  <div
                    key={item.name}
                    className={styles.dropdownContainer}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      type="button"
                      onClick={() => navigateWithTransition(item.href)}
                      className={`${styles.navLink} ${styles.navLinkWithDropdown} ${
                        pathname.startsWith('/productos') ? styles.active : ""
                      }`}
                    >
                      {item.name}
                      <ChevronDown size={18} className={styles.chevron} />
                    </button>

                    {/* Dropdown Desktop */}
                    <div className={`${styles.dropdown} ${showDropdown ? styles.dropdownShow : ''}`}>
                      <div className={styles.dropdownContent}>
                        {categories.map((category) => (
                          <Link
                            key={category.id}
                            href={`/productos?categoria=${category.slug}`}
                            className={styles.dropdownItem}
                            onClick={(e) => {
                              e.preventDefault()
                              navigateWithTransition(`/productos?categoria=${category.slug}`)
                            }}
                          >
                            {category.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => navigateWithTransition(item.href)}
                  className={`${styles.navLink} ${
                    pathname === item.href ? styles.active : ""
                  }`}
                >
                  {item.name}
                </button>
              )
            })}
          </nav>

          {/* Right Icons */}
          <div className={styles.actions}>
            <button
              onClick={openCart}
              className={styles.cartButton}
              aria-label="Carrito de compras"
              type="button"
            >
              <img
                src="/header/carrito2.png"
                alt=""
                className={styles.cartIcon}
                aria-hidden="true"
              />

              {totalItems > 0 && (
                <span className={styles.cartBadge}>{totalItems}</span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={styles.mobileMenuButton}
              aria-label="Menú"
              type="button"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ""}`}>
        <div className={styles.mobileMenuContent}>
          {navigation.map((item) => {
            if (item.hasDropdown) {
              return (
                <div key={item.name} className={styles.mobileDropdownContainer}>
                  <button
                    type="button"
                    onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                    className={`${styles.mobileMenuLink} ${
                      pathname.startsWith('/productos') ? styles.active : ""
                    }`}
                  >
                    <span>{item.name}</span>
                    <ChevronRight
                      size={20}
                      className={`${styles.mobileChevron} ${isCategoriesOpen ? styles.mobileChevronOpen : ''}`}
                    />
                  </button>

                  {/* Submenu Mobile */}
                  <div className={`${styles.mobileSubMenu} ${isCategoriesOpen ? styles.mobileSubMenuOpen : ''}`}>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => navigateWithTransition(`/productos?categoria=${category.slug}`)}
                        className={styles.mobileSubMenuItem}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              )
            }

            return (
              <button
                key={item.name}
                type="button"
                onClick={() => navigateWithTransition(item.href)}
                className={`${styles.mobileMenuLink} ${
                  pathname === item.href ? styles.active : ""
                }`}
              >
                {item.name}
              </button>
            )
          })}

          <button
            onClick={() => {
              setIsMenuOpen(false)
              openCart()
            }}
            className={styles.mobileCartButton}
            type="button"
          >
            <ShoppingCart size={22} />
            <span>Ver Carrito</span>
            {totalItems > 0 && (
              <span className={styles.mobileCartBadge}>{totalItems}</span>
            )}
          </button>
        </div>
      </div>

      {/* Overlay */}
      {isMenuOpen && (
        <div className={styles.overlay} onClick={() => setIsMenuOpen(false)} />
      )}
    </>
  )
}
