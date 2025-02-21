import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from "@/components/AuthProvider"

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['100', '400', '700'],
  preload: true,
})

export const metadata: Metadata = {
  title: 'JCDevBlog',
  description: 'Un blog para compartir conocimientos de desarrollo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}
