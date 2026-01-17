// app/fonts.ts
import localFont from 'next/font/local'

export const titleFont = localFont({
  src: [
    {
      path: '../public/fonts/helmison-notes.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/helmison-notes.otf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-title',
  display: 'optional', // Cambio de 'swap' a 'optional' para prevenir FOUT y CLS
  fallback: ['Georgia', 'serif'],
  preload: true,
  adjustFontFallback: 'Arial', // Ajusta métricas del fallback para minimizar CLS
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
  display: 'optional', // Cambio de 'swap' a 'optional' para prevenir FOUT y CLS
  fallback: ['system-ui', '-apple-system', 'Arial', 'sans-serif'],
  preload: true,
  adjustFontFallback: 'Arial', // Ajusta métricas del fallback para minimizar CLS
})