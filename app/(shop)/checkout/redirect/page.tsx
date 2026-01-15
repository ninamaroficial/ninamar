import { Suspense } from "react"
import RedirectClient from "./RedirectClient"

export const dynamic = "force-dynamic"

export default function CheckoutRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="container">
          <div className="content">
            <div className="spinner"></div>
            <h1 className="title">Cargando...</h1>
          </div>
        </div>
      }
    >
      <RedirectClient />
    </Suspense>
  )
}
