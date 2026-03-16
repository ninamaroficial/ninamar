"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag,
  Star,
  Mail, 
  Settings, 
  Sliders, 
  LogOut,
  Folder,
  MessageCircle,
  Menu,
  X
} from 'lucide-react'
import styles from './AdminNav.module.css'

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

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

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <>
      <div className={styles.navWrap}>
        <div className={styles.brandRow}>
          <Link href="/admin/orders" className={styles.brand}>
            <img src="/logo.png" alt="Niñamar" className={styles.brandLogo} />
          </Link>
          
          {/* Botón hamburguesa (solo visible en móvil) */}
          <button 
            className={styles.hamburger}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Navegación desktop y móvil */}
        <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
          <Link 
            href="/admin/orders" 
            className={`${styles.navLink} ${pathname?.startsWith('/admin/orders') ? styles.navLinkActive : ''}`}
          >
            <ShoppingBag size={20} />
            Pedidos
          </Link>

          <Link 
            href="/admin" 
            className={`${styles.navLink} ${pathname === '/admin' ? styles.navLinkActive : ''}`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>

          <Link
            href="/admin/reviews"
            className={`${styles.navLink} ${pathname?.startsWith('/admin/reviews') ? styles.navLinkActive : ''}`}
          >
            <Star size={20} />
            Opiniones
          </Link>

          <Link 
            href="/admin/productos" 
            className={`${styles.navLink} ${pathname?.startsWith('/admin/productos') ? styles.navLinkActive : ''}`}
          >
            <Package size={20} />
            Productos
          </Link>

          <Link 
            href="/admin/categorias" 
            className={`${styles.navLink} ${pathname?.startsWith('/admin/categorias') ? styles.navLinkActive : ''}`}
          >
            <Folder size={20} />
            Categorías
          </Link>

          <Link
            href="/admin/customizations"
            className={`${styles.navLink} ${pathname?.startsWith('/admin/customizations') ? styles.navLinkActive : ''}`}
          >
            <Sliders size={20} />
            Personalizaciones
          </Link>

          <Link
            href="/admin/newsletter"
            className={`${styles.navLink} ${pathname?.startsWith('/admin/newsletter') ? styles.navLinkActive : ''}`}
          >
            <Mail size={20} />
            Newsletter
          </Link>

          {/* <Link
            href="/admin/whatsapp"
            className={`${styles.navLink} ${pathname?.startsWith('/admin/whatsapp') ? styles.navLinkActive : ''}`}
          >
            <MessageCircle size={20} />
            Chats WhatsApp
          </Link> */}

          <Link 
            href="/admin/settings" 
            className={`${styles.navLink} ${pathname === '/admin/settings' ? styles.navLinkActive : ''}`}
          >
            <Settings size={20} />
            Configuración
          </Link>

          <button onClick={handleLogout} className={styles.logoutButton}>
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </nav>
      </div>

      {/* Overlay para cerrar el menú en móvil */}
      {isMenuOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  )
}