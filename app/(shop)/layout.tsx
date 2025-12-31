import { Suspense } from 'react'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { CartProvider } from '@/lib/context/CartContext'
import LoadingScreen from '@/components/ui/LoadingScreen'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CartProvider>
      <LoadingScreen />
      <Header />
      <main>
        <Suspense fallback={<LoadingScreen />}>
          {children}
        </Suspense>
      </main>
      <SpeedInsights />
      <Analytics/>
      <Footer />
    </CartProvider>
  )
}