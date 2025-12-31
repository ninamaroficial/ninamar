"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Settings, 
  Sliders, 
  LogOut 
} from 'lucide-react'
import styles from './AdminNav.module.css'

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <nav className={styles.nav}>
      <Link 
        href="/admin/dashboard" 
        className={`${styles.navLink} ${pathname === '/admin/dashboard' ? styles.navLinkActive : ''}`}
      >
        <LayoutDashboard size={20} />
        Dashboard
      </Link>

      {/* <Link 
        href="/admin/orders" 
        className={`${styles.navLink} ${pathname?.startsWith('/admin/orders') ? styles.navLinkActive : ''}`}
      >
        <Package size={20} />
        Órdenes
      </Link> */}

      <Link 
        href="/admin/productos" 
        className={`${styles.navLink} ${pathname?.startsWith('/admin/productos') ? styles.navLinkActive : ''}`}
      >
        <ShoppingBag size={20} />
        Productos
      </Link>

      <Link 
        href="/admin/personalizaciones" 
        className={`${styles.navLink} ${pathname?.startsWith('/admin/personalizaciones') ? styles.navLinkActive : ''}`}
      >
        <Sliders size={20} />
        Personalizaciones
      </Link>

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
  )
}