import type { Metadata } from "next";
import { titleFont, bodyFont } from './fonts'
import "./globals.css";
import { Clicker_Script } from 'next/font/google'

const clickerScript = Clicker_Script({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-clicker'
})

export const metadata: Metadata = {
  metadataBase: new URL('https://niñamar.com'),
  
  title: {
    default: "Niñamar - Accesorios Artesanales Hechos a Mano | Popayán, Colombia",
    template: "%s | Niñamar"
  },
  
  description: "Descubre accesorios únicos y personalizados hechos a mano con amor en Popayán, Colombia. Collares, pulseras, aretes y más. Cada pieza cuenta tu historia.",
  
  keywords: [
    "accesorios personalizados",
    "joyas artesanales",
    "accesorios artesanales",
    "accesorios popayán",
    "collares personalizados",
    "pulseras hechas a mano",
    "aretes únicos",
    "joyería colombia",
    "accesorios colombia",
    "regalos únicos",
    "joyería artesanal popayán"
  ],
  
  authors: [{ name: "Niñamar", url: "https://niñamar.com" }],
  creator: "Niñamar",
  publisher: "Niñamar",
  
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  
  alternates: {
    canonical: '/',
  },
  
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "https://niñamar.com",
    siteName: "Niñamar",
    title: "Niñamar - Accesorios Artesanales Hechos a Mano",
    description: "Descubre accesorios únicos y personalizados hechos a mano con amor en Popayán, Colombia. Collares, pulseras, aretes y más.",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "Niñamar Logo - Accesorios Artesanales",
      },
    ],
  },
  
  twitter: {
    card: "summary_large_image",
    title: "Niñamar - Accesorios Artesanales",
    description: "Descubre accesorios únicos hechos a mano con amor.",
    images: ["/icon-512.png"],
  },
  
  // ✅ CONFIGURACIÓN DE ICONOS (FAVICON)
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', type: 'image/png', sizes: '96x96' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/favicon.svg',
        color: '#d3aacfff',
      },
    ],
  },
  
  // ✅ MANIFEST (PWA)
  manifest: '/manifest.json',
  
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  category: 'shopping',
  classification: 'Accesorios y Joyería Artesanal',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="theme-color" content="#ffeafdff" />
        <meta name="color-scheme" content="light" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Niñamar" />
        <link rel="canonical" href="https://niñamar.com" />
      </head>
      <body className={`${titleFont.variable} ${bodyFont.variable} ${clickerScript.variable}`}>
        {children}
      </body>
    </html>
  );
}