import type { Metadata } from "next"
import { Inter, Twinkle_Star } from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import CartDrawer from "@/components/cart/CartDrawer"
import { CartProvider } from "@/lib/context/CartContext"

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
  title: "Niña Mar - Joyas Personalizadas",
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
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  )
}