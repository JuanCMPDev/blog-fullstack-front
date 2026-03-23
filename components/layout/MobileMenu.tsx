"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from "@/components/ui/sheet"
import { VisuallyHidden } from "@/components/ui/Visually-hidden"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Menu,
  Search,
  Sun,
  Moon,
  UserCircle,
  LogOut,
  Home,
  FolderKanban,
  Mail,
  LayoutDashboard,
  BookOpen,
  ChevronRight,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth"
import { getAvatarUrl } from "@/lib/utils"
import type React from "react"
import type { MobileMenuProps, NavItem } from "@/lib/types"

const NavbarLinks: NavItem[] = [
  { id: "home", label: "Inicio", href: "/", icon: Home },
  { id: "courses", label: "Cursos", href: "/courses", icon: BookOpen },
  { id: "projects", label: "Proyectos", href: "/projects", icon: FolderKanban },
  { id: "contact", label: "Contacto", href: "/contact", icon: Mail },
]

export function MobileMenu({ theme, setTheme, user }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const { logout } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const pathname = usePathname()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`)
      setOpen(false)
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[340px] p-0 border-l-0 shadow-2xl" aria-describedby={undefined}>
        <VisuallyHidden><SheetTitle>Menú de navegación</SheetTitle></VisuallyHidden>
        <div className="flex flex-col h-full overflow-hidden">
          {/* ── Header: branding + search ── */}
          <div className="px-5 pt-5 pb-4 space-y-4">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2"
              >
                <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-foreground">T</span>
                </div>
                <span className="text-base font-headline font-bold">
                  Techno<span className="text-primary">Espacio</span>
                </span>
              </Link>
            </div>

            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 bg-muted/50 border-border/30 rounded-lg text-sm"
                />
              </div>
            </form>
          </div>

          {/* ── User card (if logged in) ── */}
          {user && (
            <div className="mx-5 mb-3">
              <SheetClose asChild>
                <Link
                  href={`/profile/${user.nick}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors"
                >
                  <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                    <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-sm font-bold">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                </Link>
              </SheetClose>
            </div>
          )}

          {/* ── Navigation ── */}
          <nav className="flex-1 overflow-y-auto px-5 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2 px-3">
              Navegación
            </p>
            <div className="space-y-0.5">
              {NavbarLinks.map((item) => {
                const active = isActive(item.href)
                return (
                  <SheetClose asChild key={item.id}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          active ? "bg-primary/15" : "bg-muted/50"
                        }`}
                      >
                        <item.icon className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <span>{item.label}</span>
                      {active && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </Link>
                  </SheetClose>
                )
              })}
            </div>

            {/* ── User-only links ── */}
            {user && (
              <>
                <div className="my-3 h-px bg-border/30" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2 px-3">
                  Tu cuenta
                </p>
                <div className="space-y-0.5">
                  <SheetClose asChild>
                    <Link
                      href={`/profile/${user.nick}`}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        pathname.startsWith("/profile")
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-muted/50">
                        <UserCircle className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span>Perfil</span>
                    </Link>
                  </SheetClose>

                  {(user.role === "admin" || user.role === "editor") && (
                    <SheetClose asChild>
                      <Link
                        href="/admin"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          pathname.startsWith("/admin")
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted/50"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-muted/50">
                          <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span>Dashboard</span>
                      </Link>
                    </SheetClose>
                  )}
                </div>
              </>
            )}
          </nav>

          {/* ── Footer: theme + auth ── */}
          <div className="px-5 py-4 border-t border-border/30 space-y-2">
            <Button
              variant="ghost"
              onClick={toggleTheme}
              className="w-full justify-start h-10 px-3 text-sm font-medium hover:bg-muted/50"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted/50 mr-3">
                {theme === "light" ? (
                  <Moon className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Sun className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              {theme === "light" ? "Modo oscuro" : "Modo claro"}
            </Button>

            {user ? (
              <SheetClose asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-10 px-3 text-sm font-medium text-red-500/80 hover:text-red-500 hover:bg-red-500/5"
                  onClick={logout}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/5 mr-3">
                    <LogOut className="h-4 w-4 text-red-500/70" />
                  </div>
                  Cerrar sesión
                </Button>
              </SheetClose>
            ) : (
              <div className="flex gap-2 pt-1">
                <SheetClose asChild>
                  <Button asChild variant="outline" size="sm" className="flex-1 h-9">
                    <Link href="/signin">Iniciar sesión</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild size="sm" className="flex-1 h-9">
                    <Link href="/signup">Registrarse</Link>
                  </Button>
                </SheetClose>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
