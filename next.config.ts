import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
    // Optimización de imágenes
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    qualities: [60, 70, 75, 85],
  },

  // Optimizaciones de producción
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,

  // Experimental: Optimizar chunks
  experimental: {
    optimizePackageImports: ['lucide-react'],
    optimizeCss: true, // Inline CSS crítico
  },

  // Headers de seguridad mejorados para e-commerce
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Prevenir ataques XSS
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Prevenir clickjacking
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          // Control de DNS prefetch
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          // Política de referrer para privacidad
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Permissions Policy (antes Feature Policy)
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          // Strict-Transport-Security (HSTS) - Solo en producción HTTPS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          // Content Security Policy (CSP) - Importante para pagos
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self' blob:",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://sdk.mercadopago.com https://www.mercadopago.com https://vitals.vercel-insights.com https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://api.mercadopago.com https://vitals.vercel-insights.com https://api.resend.com wss://*.supabase.co blob:",
              "frame-src 'self' https://www.mercadopago.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://www.mercadopago.com",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
        ],
      },
    ];
  },
};

export default nextConfig;