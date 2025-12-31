import type { Metadata } from "next";
import { titleFont, bodyFont } from './fonts'
import "./globals.css";

export const metadata: Metadata = {
  title: "Niñamar - Joyas Personalizadas",
  description: "Joyas únicas hechas a mano con amor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${titleFont.variable} ${bodyFont.variable}`}>
      <body className={bodyFont.className}>
        {children}
      </body>
    </html>
  );
}