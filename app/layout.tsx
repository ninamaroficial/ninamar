import type { Metadata } from "next";
import { titleFont, bodyFont } from './fonts'
import "./globals.css";

export const metadata: Metadata = {
  title: "Niñamar - Accesarios Artesanales",
  description: "Descubre joyas únicas y personalizadas hechas a mano con amor en Popayán, Colombia. Collares, pulseras, aretes y más. Cada pieza cuenta tu historia.",
  keywords: "joyas personalizadas, joyas artesanales, collares, pulseras, aretes, joyería Popayán, joyas Colombia",
  authors: [{ name: "Niñamar" }],
  creator: "Niñamar",
  publisher: "Niñamar",
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "https://niñamar.com",
    siteName: "Niñamar",
    title: "Niñamar - Accesarios Artesanales",
    description: "Descubre joyas únicas y personalizadas hechas a mano con amor en Popayán, Colombia.",
    images: [
      {
        url: "https://niñamar.com/logo.png", // Necesitarás crear esta imagen
        width: 1200,
        height: 630,
        alt: "Niñamar - Accesarios Artesanales",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Niñamar - Accesarios Artesanales",
    description: "Descubre joyas únicas y personalizadas hechas a mano con amor.",
    images: ["https://niñamar.com/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // google: 'tu-codigo-de-verificacion', // Agrega cuando tengas Google Search Console
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="theme-color" content="#a6e8e4" />
        <link rel="canonical" href="https://niñamar.com" />
      </head>
      <body className={`${titleFont.variable} ${bodyFont.variable}`}>
        {children}
      </body>
    </html>
  );
}