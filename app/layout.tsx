import type { Metadata } from 'next'
import { Inter, Manrope } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/common/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from "@/components/layout/AuthProvider"

import { GoogleAnalytics } from '@next/third-parties/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['100', '400', '500', '600', '700'],
  preload: true,
  variable: '--font-inter',
})

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '600', '700', '800'],
  preload: true,
  variable: '--font-manrope',
})

export const metadata: Metadata = {
  title: 'Techno Espacio',
  description: 'Tu espacio de tecnología: noticias, cursos, tutoriales y proyectos sobre IA, desarrollo web, gadgets y tendencias digitales.',
  keywords: 'tecnología, inteligencia artificial, desarrollo web, gadgets, tutoriales, cursos, IA, programación, tendencias tech',
  authors: [{ name: 'Techno Espacio' }],
  category: 'Tecnología',
  openGraph: {
    title: 'Techno Espacio - Tecnología, IA y desarrollo',
    description: 'Noticias, cursos y proyectos sobre inteligencia artificial, desarrollo web, gadgets y tendencias digitales.',
    url: 'https://technoespacio.com',
    siteName: 'Techno Espacio',
    images: [
      {
        url: '/tecno-espacio.png',
        width: 1200,
        height: 630,
        alt: 'Techno Espacio - Tecnología, IA y desarrollo',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Techno Espacio - Tecnología, IA y desarrollo',
    description: 'Noticias, cursos y proyectos sobre inteligencia artificial, desarrollo web, gadgets y tendencias digitales.',
    images: ['/tecno-espacio.png'],
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        <link rel="preload" href="/logo.png" as="image" />
      </head>
      <body className={`${inter.variable} ${manrope.variable} ${inter.className}`}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
        <Toaster />
        <GoogleAnalytics gaId="G-7XXV5BXWEF" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
