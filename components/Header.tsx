'use client'

import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Moon, Sun, Search, Code } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MobileMenu } from './MobileMenu'
import { UserMenu } from './UserMenu'

// Mock user data (replace with real authentication later)
const user = {
  name: 'John Doe',
  image: '/placeholder.svg?height=32&width=32'
}

export function Header() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-200 ${scrolled ? 'bg-background/80 backdrop-blur-sm shadow-md' : 'bg-background'
      }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Code className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold text-foreground">
              JCDev<span className="text-primary">Blog</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6 flex-1 justify-center">
            <nav>
              <ul className="flex space-x-6">
                <li><Link href="/" className="hover:text-primary transition-colors">Inicio</Link></li>
                <li><Link href="/exercises" className="hover:text-primary transition-colors">Ejercicios</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contacto</Link></li>
              </ul>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden lg:block"> {/* Changed from md:block to lg:block */}
              <Input
                type="search"
                placeholder="Buscar..."
                className="w-[200px] pl-8"
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="hidden md:inline-flex"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            {user && (
              <UserMenu user={user} />
            )}
          </div>

          <MobileMenu theme={theme} setTheme={setTheme} user={user} />
        </div>
      </div>
    </header>
  )
}

