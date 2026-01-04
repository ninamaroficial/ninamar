"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ShoppingCart, Package, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { useCart } from "@/lib/context/CartContext"
import styles from "./header.module.css"
import Image from "next/image"

type TransitionPhase = "idle" | "enter" | "exit"

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { totalItems, openCart } = useCart()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [transitionPhase, setTransitionPhase] = useState<TransitionPhase>("idle")

  const navigation = [
    { name: "Inicio", href: "/" },
    { name: "Productos", href: "/productos" },
    { name: "Seguimiento", href: "/seguimiento" },
    { name: "Acerca de Niñamar", href: "/acerca" },
    { name: "Contacto", href: "/contacto" },
  ]

  const navigateWithTransition = (href: string) => {
    if (href === pathname) {
      setIsMenuOpen(false)
      return
    }

    setTransitionPhase("enter")
    setIsMenuOpen(false)

    window.setTimeout(() => {
      router.push(href)
    }, 420) // debe coincidir con el CSS (enter)
  }

  // Cuando cambia la ruta, hacemos salida y luego apagamos
  useEffect(() => {
    if (transitionPhase === "enter") {
      setTransitionPhase("exit")
      window.setTimeout(() => setTransitionPhase("idle"), 420) // CSS (exit)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Detectar scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Prevenir scroll cuando el menú está abierto
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMenuOpen])

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
                src="/images/gif-logo3.gif"
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
            {navigation.map((item) => (
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
            ))}
          </nav>

          {/* Right Icons */}
          <div className={styles.actions}>
            <button
              onClick={openCart}
              className={styles.cartButton}
              aria-label="Carrito de compras"
              type="button"
            >
              <ShoppingCart size={22} />
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
          {navigation.map((item) => (
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
          ))}

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
