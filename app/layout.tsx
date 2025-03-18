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
  description: 'Un blog de tecnología, programación y desarrollo web.',

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
