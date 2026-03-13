"use client"

import { usePathname } from "next/navigation"
import AdminNav from "@/components/admin/AdminNav"
import "../globals.css"
import styles from "./admin-layout.module.css"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Rutas que NO deben mostrar el header con navegación
  const authRoutes = ['/admin/login', '/admin/register']
  const isAuthRoute = authRoutes.includes(pathname || '')
  const isOrderGuideRoute = /^\/admin\/orders\/[^/]+\/guia$/.test(pathname || '')

  // Si es ruta de autenticación o guía imprimible, solo renderizar children
  if (isAuthRoute || isOrderGuideRoute) {
    return <>{children}</>
  }

  // Para otras rutas, mostrar layout completo
  return (
    <div className={styles.adminLayout}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <AdminNav />
        </div>
      </header>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}