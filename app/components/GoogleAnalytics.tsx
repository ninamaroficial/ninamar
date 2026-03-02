'use client'

import { GoogleTagManager } from '@next/third-parties/google'
import { useEffect } from 'react'

export default function GoogleAnalytics() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID

  useEffect(() => {
    // Evento de view_page automático
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'page_view',
        page_path: window.location.pathname,
        page_title: document.title,
      })
    }
  }, [])

  if (!gtmId) {
    console.warn('NEXT_PUBLIC_GTM_ID not configured')
    return null
  }

  return <GoogleTagManager gtmId={gtmId} />
}
