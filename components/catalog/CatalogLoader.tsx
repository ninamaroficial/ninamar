'use client'

import dynamic from 'next/dynamic'

const CatalogViewer = dynamic(() => import('./CatalogViewer'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
      <p style={{ color: '#6b7280' }}>Cargando catálogo...</p>
    </div>
  ),
})

interface CatalogLoaderProps {
  pdfUrl: string
}

export default function CatalogLoader({ pdfUrl }: CatalogLoaderProps) {
  return <CatalogViewer pdfUrl={pdfUrl} />
}
