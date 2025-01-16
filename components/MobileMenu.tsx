import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from 'lucide-react'
import Link from "next/link"
import { UserAvatar } from "./UserAvatar"
import { VisuallyHidden } from "@/components/ui/visually-hidden"

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
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <VisuallyHidden>
          <SheetTitle>Menu</SheetTitle>
        </VisuallyHidden>
        <nav className="flex flex-col gap-4">
          <Link href="/" className="text-lg font-semibold hover:text-primary">
            Inicio
          </Link>
          <Link href="/ejercicios" className="text-lg font-semibold hover:text-primary">
            Ejercicios
          </Link>
          <Link href="/contact" className="text-lg font-semibold hover:text-primary">
            Contacto
          </Link>
          <Button
            variant="outline"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="justify-start"
          >
            {theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
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
            <Button className="mt-4">Iniciar sesión</Button>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

