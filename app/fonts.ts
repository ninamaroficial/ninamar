// app/fonts.ts
import localFont from 'next/font/local'

export const titleFont = localFont({
  src: [
      {
      path: '../public/fonts/Helmison Notes.woff2', // ← WOFF2 primero
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Helmison Notes.otf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-title',
  display: 'swap',
  fallback: ['Georgia', 'serif'], // ← AGREGAR FALLBACK
  preload: true, // ← ASEGURAR PRECARGA
})

export const bodyFont = localFont({
  src: [
    {
      path: '../public/fonts/corbel-light.ttf',
      weight: '200',
      style: 'normal',
    },
  ],
  variable: '--font-body',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'Arial', 'sans-serif'], // ← AGREGAR FALLBACK
  preload: true, // ← ASEGURAR PRECARGA
})
