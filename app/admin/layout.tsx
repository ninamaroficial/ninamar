import type { Metadata } from "next"
import "../globals.css"

export const metadata: Metadata = {
  title: "Admin - Niñamar",
  description: "Panel de administración",
  robots: {
    index: false,
    follow: false
  }
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}