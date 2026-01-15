import { Suspense } from "react"
import PendingClient from "./PendingClient"

export const dynamic = "force-dynamic"

export default function PendingPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <PendingClient />
    </Suspense>
  )
}
