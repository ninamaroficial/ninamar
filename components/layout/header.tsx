"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, Package, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCart } from '@/lib/context/CartContext'
import styles from './header.module.css'
import Image from 'next/image'

export default function Header() {
  const pathname = usePathname()
  const { totalItems, openCart } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const navigation = [
    { name: 'Inicio', href: '/' },
    { name: 'Productos', href: '/productos' },
    { name: 'Seguimiento', href: '/seguimiento' },
    { name: 'Acerca de Niñamar', href: '/acerca' },
    { name: 'Contacto', href: '/contacto' },
  ]

  // Detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  return (
    <>
      {/* Promotional Banner */}
      <div className={styles.banner}>
        <div className={styles.bannerContent}>
          <Package size={16} className={styles.bannerIcon} />
          <p className={styles.bannerText}>
            ✨ Envío <strong>GRATIS</strong> en compras superiores a <strong>$100.000</strong> a toda Colombia
          </p>
        </div>
      </div>

      {/* Main Header */}
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={styles.headerContent}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <div className={styles.logoImage}>
              <Image
                src="/images/gif-logo3.gif"  // O "/logo.svg" si usas SVG
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
              <Link
                key={item.name}
                href={item.href}
                className={`${styles.navLink} ${pathname === item.href ? styles.active : ''}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Icons */}
          <div className={styles.actions}>
            <button 
              onClick={openCart}
              className={styles.cartButton} 
              aria-label="Carrito de compras"
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
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`}>
        <div className={styles.mobileMenuContent}>
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`${styles.mobileMenuLink} ${pathname === item.href ? styles.active : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          
          <button
            onClick={() => {
              setIsMenuOpen(false)
              openCart()
            }}
            className={styles.mobileCartButton}
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
        <div 
          className={styles.overlay}
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  )
}