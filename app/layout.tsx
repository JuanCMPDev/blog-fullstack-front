import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/common/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from "@/components/layout/AuthProvider"
import { SettingsProvider } from '@/hooks/use-settings'
import { GoogleAnalytics } from '@next/third-parties/google'
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['100', '400', '700'],
  preload: true,
})

export const metadata: Metadata = {
  title: 'Techno Espacio',
  description: 'Un blog de tecnología, programación y desarrollo web con tutoriales, consejos y recursos para desarrolladores.',
  keywords: 'tecnología, programación, desarrollo web, tutoriales, JavaScript, React, Next.js',
  authors: [{ name: 'Techno Espacio' }],
  category: 'Tecnología',
  openGraph: {
    title: 'Techno Espacio - Blog de tecnología y programación',
    description: 'Tutoriales, consejos y recursos para desarrolladores web y entusiastas de la tecnología.',
    url: 'https://technoespacio.com',
    siteName: 'Techno Espacio',
    images: [
      {
        url: '/tecno-espacio.png',
        width: 1200,
        height: 630,
        alt: 'Techno Espacio - Blog de tecnología y programación',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Techno Espacio - Blog de tecnología y programación',
    description: 'Tutoriales, consejos y recursos para desarrolladores web y entusiastas de la tecnología.',
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
      <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SettingsProvider>
              <AuthProvider>{children}</AuthProvider>
            </SettingsProvider>
          </ThemeProvider>
        <Toaster />
        <GoogleAnalytics gaId="G-7XXV5BXWEF" />
      </body>
    </html>
  )
}
