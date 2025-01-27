"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Menu, Search, Sun, Moon, UserCircle, Settings, LogOut, Home, Dumbbell, Mail, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth"

interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ElementType
}

const NavbarLinks: NavItem[] = [
  { id: "home", label: "Inicio", href: "/", icon: Home },
  { id: "exercises", label: "Ejercicios", href: "/exercises", icon: Dumbbell },
  { id: "contact", label: "Contacto", href: "/contacto", icon: Mail },
]

interface MobileMenuProps {
  theme: string | undefined
  setTheme: (theme: string) => void
  user: { name: string; email: string; image?: string; nick: string } | null
}

export function MobileMenu({ theme, setTheme, user }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const { logout } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`)
      setOpen(false)
    }
  }

  const menuItems = [
    { icon: UserCircle, label: "Perfil", href: `/profile/${user?.nick}` },
    { icon: Settings, label: "Configuración", href: "/settings" },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[350px] p-0">
        <motion.div
          className="flex flex-col h-full bg-gradient-to-b from-background to-background/80 backdrop-blur-sm"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10">
            <div className="flex justify-between items-center mb-4">
              <SheetTitle className="text-2xl font-bold">Menu</SheetTitle>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-5 w-5" />
                </Button>
              </SheetClose>
            </div>
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 bg-background/50"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </form>
            {user ? (
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="h-10 w-10 border-2 border-primary">
                  <AvatarImage src={user.image || "/placeholder-user.jpg"} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            ) : (
              <div className="flex space-x-2 mb-4">
                <SheetClose asChild>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href="/signin">Iniciar sesión</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild size="sm" className="flex-1">
                    <Link href="/signup">Registrarse</Link>
                  </Button>
                </SheetClose>
              </div>
            )}
          </div>
          <nav className="flex-1 overflow-y-auto px-6 py-4">
            {NavbarLinks.map((item) => (
              <SheetClose asChild key={item.id}>
                <Link
                  className="flex items-center text-lg font-medium hover:text-primary transition-colors py-3 border-b border-border"
                  href={item.href}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              </SheetClose>
            ))}
            {user && (
              <>
                {menuItems.map((item, index) => (
                  <SheetClose asChild key={index}>
                    <Link
                      href={item.href}
                      className="flex items-center text-lg font-medium hover:text-primary transition-colors py-3 border-b border-border"
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </SheetClose>
                ))}
              </>
            )}
          </nav>
          <div className="p-6 bg-gradient-to-r from-background/50 to-background mt-auto">
            <Button
              variant="outline"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="w-full justify-start mb-4"
            >
              {theme === "light" ? (
                <>
                  <Moon className="mr-2 h-4 w-4" />
                  Modo oscuro
                </>
              ) : (
                <>
                  <Sun className="mr-2 h-4 w-4" />
                  Modo claro
                </>
              )}
            </Button>
            {user && (
              <SheetClose asChild>
                <Button variant="destructive" className="w-full justify-start" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </Button>
              </SheetClose>
            )}
          </div>
        </motion.div>
      </SheetContent>
    </Sheet>
  )
}

