import { Suspense } from 'react'
import UnsubscribeContent from './UnsubscribeContent'

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div style={{ 
        minHeight: '80vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <p>Cargando...</p>
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  )
}