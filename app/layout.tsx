import type { Metadata } from "next"
import { Inter, Twinkle_Star } from "next/font/google"
import "./globals.css"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
})

const twinkleStar = Twinkle_Star({ 
  weight: "400",
  subsets: ["latin"],
  variable: "--font-twinkle"
})

export const metadata: Metadata = {
  title: "Niñamar - Joyas Personalizadas",
  description: "Crea joyas únicas diseñadas especialmente para ti",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${twinkleStar.variable}`}>
        {children}
      </body>
    </html>
  )
}