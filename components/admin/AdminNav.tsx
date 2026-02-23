"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  Mail, 
  Settings, 
  Sliders, 
  LogOut,
  Folder,
  MessageCircle
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
    <div className={styles.navWrap}>
      <div className={styles.brandRow}>
        <Link href="/admin" className={styles.brand}>
          <img src="/logo.png" alt="Niñamar" className={styles.brandLogo} />
        </Link>
      </div>

      <nav className={styles.nav}>
        <Link 
          href="/admin" 
          className={`${styles.navLink} ${pathname === '/admin' ? styles.navLinkActive : ''}`}
        >
          <LayoutDashboard size={20} />
          Dashboard
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

        <Link
          href="/admin/whatsapp"
          className={`${styles.navLink} ${pathname?.startsWith('/admin/whatsapp') ? styles.navLinkActive : ''}`}
        >
          <MessageCircle size={20} />
          Chats WhatsApp
        </Link>

        <Link 
          href="/admin/settings" 
          className={`${styles.navLink} ${pathname === '/admin/settings' ? styles.navLinkActive : ''}`}
        >
          <Settings size={20} />
          Configuración
        </Link>
      </nav>

      <button onClick={handleLogout} className={styles.logoutButton}>
        <LogOut size={20} />
        Cerrar Sesión
      </button>
    </div>
  )
}