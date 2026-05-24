import type { NextConfig } from 'next'

const securityHeaders = [
  // Cegah clickjacking
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  // Cegah MIME type sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Referrer policy
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Permissions policy (matikan fitur browser yang tidak dipakai)
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
  // HSTS (force HTTPS)
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // Content Security Policy
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",  // unsafe-eval dibutuhkan Next.js
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.supabase.co https://cdn.jsdelivr.net",
      "connect-src 'self' https://*.supabase.co https://api.anthropic.com https://generativelanguage.googleapis.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
  // Remove X-Powered-By
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
]

const nextConfig: NextConfig = {
  // Eksperimental optimasi
  experimental: {
    // Optimasi CSS (kurangi bundle size)
    optimizeCss: true,
  },
  
  // Kompilasi lebih cepat — hanya compile yang dibutuhkan
  compiler: {
    // Hapus console.log di production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wqchbiunmcwxipusjsfe.supabase.co',
      },
    ],
    // Ukuran device yang relevan (kurangi dari default yang terlalu banyak)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Cache gambar lebih lama
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 hari
  },
  
  // Headers security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  
  // Redirect www ke non-www
  async redirects() {
    return [
      {
        source: '/',
        has: [{ type: 'host', value: 'www.najinkyou.dev' }],
        destination: 'https://najinkyou.dev/',
        permanent: true,
      },
    ]
  },
  
  // PoweredByHeader: matikan untuk security
  poweredByHeader: false,
  
  // Compress responses
  compress: true,
}

export default nextConfig
