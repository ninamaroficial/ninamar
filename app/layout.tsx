import type { Metadata } from "next";
import { titleFont, bodyFont } from './fonts'
import "./globals.css";
import WhatsAppButton from "@/components/ui/WhatsAppButton"
import GoogleAnalytics from "@/app/components/GoogleAnalytics"
import GoogleAds from "@/app/components/GoogleAds"

export const metadata: Metadata = {
  metadataBase: new URL('https://xn--niamar-xwa.com'),

  title: {
    default: "Niñamar - Accesorios Artesanales Hechos a Mano | Popayán, Colombia",
    template: "%s | Niñamar"
  },

  applicationName: "Niñamar",

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
  
  authors: [{ name: "Niñamar", url: "https://xn--niamar-xwa.com" }],
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
    url: "https://xn--niamar-xwa.com",
    siteName: "Niñamar",
    title: "Niñamar - Accesorios Artesanales Hechos a Mano",
    description: "Descubre accesorios únicos y personalizados hechos a mano con amor en Popayán, Colombia. Collares, pulseras, aretes y más.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Niñamar - Accesorios Artesanales Hechos a Mano",
        type: "image/png",
      },
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "Niñamar Logo",
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Niñamar - Accesorios Artesanales Hechos a Mano",
    description: "Descubre accesorios únicos y personalizados hechos a mano con amor en Popayán, Colombia.",
    images: ["/og-image.png"],
    creator: "@ninamar",
    site: "@ninamar",
  },
  
  // ✅ CONFIGURACIÓN DE ICONOS (FAVICON)
icons: {
  icon: [
    { url: "/favicon.ico" }, // fallback principal
    { url: "/favicon.svg", type: "image/svg+xml" },
    { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
  ],
  apple: [
    { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
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
        <link rel="canonical" href="https://xn--niamar-xwa.com" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        {/* Preconnect para recursos externos */}
        <link rel="preconnect" href="https://vitals.vercel-insights.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://vitals.vercel-insights.com" />

        {/* JSON-LD para SEO estructurado */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Store',
              name: 'Niñamar',
              alternateName: 'Niñamar Accesorios',
              url: 'https://xn--niamar-xwa.com',
              logo: 'https://xn--niamar-xwa.com/icon-512.png',
              image: 'https://xn--niamar-xwa.com/og-image.png',
              description: 'Accesorios únicos y personalizados hechos a mano con amor en Popayán, Colombia. Collares, pulseras, aretes y más.',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Popayán',
                addressRegion: 'Cauca',
                addressCountry: 'CO'
              },
              priceRange: '$$',
              sameAs: [
                'https://www.instagram.com/ninamar',
                'https://www.facebook.com/ninamar'
              ]
            })
          }}
        />
      </head>
      <body className={`${titleFont.variable} ${bodyFont.variable}`}>
        <GoogleAnalytics />
        <GoogleAds />
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}