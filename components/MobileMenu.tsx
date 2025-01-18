import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Menu, Search, Sun, Moon } from 'lucide-react'
import Link from "next/link"
import { UserAvatar } from "./UserAvatar"

interface MobileMenuProps {
  theme: string | undefined
  setTheme: (theme: string) => void
  user: { name: string; image: string } | null
}

export function MobileMenu({ theme, setTheme, user }: MobileMenuProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[80%] sm:w-[350px] max-w-sm">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <SheetTitle>Menu</SheetTitle>
          </div>
          <div className="relative mb-4">
            <Input
              type="search"
              placeholder="Buscar..."
              className="w-full pl-8"
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <nav className="flex flex-col gap-4">
            <Link href="/" className="text-lg font-semibold hover:text-primary">
              Inicio
            </Link>
            <Link href="/exercises" className="text-lg font-semibold hover:text-primary">
              Ejercicios
            </Link>
            <Link href="/contact" className="text-lg font-semibold hover:text-primary">
              Contacto
            </Link>
          </nav>
          <div className="mt-auto">
            <Button
              variant="outline"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="w-full justify-start mb-4"
            >
              {theme === 'light' ? (
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
            {user ? (
              <div className="flex items-center gap-2 pt-4 border-t">
                <UserAvatar name={user.name} image={user.image} />
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <Button variant="link" className="p-0 h-auto font-normal">
                    Cerrar sesión
                  </Button>
                </div>
              </div>
            ) : (
              <Button className="w-full">Iniciar sesión</Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

