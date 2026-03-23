"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  LayoutDashboardIcon as Dashboard,
  Users,
  FileText,
  Moon,
  Sun,
  Home,
  LogOut,
  ChevronDown,
  UserPlus,
  PenSquare,
  ListTodo,
  FolderKanban,
  BookOpen,
  ClipboardCheck,
  Menu,
  type LucideIcon,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useAuth } from "@/lib/auth"
import { useTheme } from "next-themes"
import { getAvatarUrl } from "@/lib/utils"

interface NavItem {
  title: string
  href?: string
  icon: LucideIcon
  subItems?: NavItem[]
}

function useNavItems(role?: string): NavItem[] {
  return useMemo(() => [
    { title: "Dashboard", href: "/admin", icon: Dashboard },
    ...(role === "admin" ? [
      { title: "Usuarios", icon: Users, subItems: [{ title: "Administrar Usuarios", href: "/admin/users", icon: UserPlus }] },
      { title: "Proyectos", href: "/admin/projects", icon: FolderKanban },
      {
        title: "Cursos", icon: BookOpen,
        subItems: [
          { title: "Administrar Cursos", href: "/admin/courses", icon: BookOpen },
          { title: "Exámenes", href: "/admin/exams", icon: ClipboardCheck },
        ],
      },
    ] : []),
    {
      title: "Posts", icon: FileText,
      subItems: [
        { title: "Crear Post", href: "/admin/posts/create", icon: PenSquare },
        { title: "Administrar Posts", href: "/admin/posts", icon: ListTodo },
      ],
    },
  ], [role])
}

function NavItemRow({
  item,
  depth = 0,
  pathname,
  openItems,
  toggleItem,
  onNavigate,
}: {
  item: NavItem
  depth?: number
  pathname: string
  openItems: string[]
  toggleItem: (title: string) => void
  onNavigate?: () => void
}) {
  const isActive = item.href === pathname
  const isSubActive = item.subItems?.some((s) => s.href === pathname)
  const hasSubItems = !!item.subItems?.length
  const isOpen = openItems.includes(item.title)

  if (hasSubItems) {
    return (
      <Collapsible open={isOpen} onOpenChange={() => toggleItem(item.title)}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isSubActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <item.icon className={cn("h-4 w-4 shrink-0", isSubActive ? "text-primary" : "")} />
            <span className="flex-1 text-left">{item.title}</span>
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", isOpen && "rotate-180")} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-1 ml-3 pl-3 border-l border-border/60 space-y-0.5">
            {item.subItems?.map((sub) => (
              <NavItemRow
                key={sub.href}
                item={sub}
                depth={depth + 1}
                pathname={pathname}
                openItems={openItems}
                toggleItem={toggleItem}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <Link
      href={item.href || "#"}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full" />
      )}
      <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "")} />
      <span>{item.title}</span>
    </Link>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const [openItems, setOpenItems] = useState<string[]>([])
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const role = user?.roleAsString || user?.role
  const navItems = useNavItems(typeof role === "string" ? role : undefined)

  // Auto-expand groups that contain the active route
  useEffect(() => {
    const activeGroups = navItems
      .filter((item) => item.subItems?.some((s) => s.href === pathname))
      .map((item) => item.title)
    setOpenItems(activeGroups)
  }, [pathname, navItems])

  const toggleItem = (title: string) => {
    setOpenItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    )
  }

  const roleLabel = role === "admin" ? "Administrador" : role === "editor" ? "Editor" : "Usuario"

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex h-14 items-center px-4 border-b border-border/60 shrink-0">
        <Link href="/admin" className="flex items-center gap-2.5" onClick={onNavigate}>
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-xs font-bold text-primary-foreground">T</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold">Techno Espacio</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Admin</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 py-3 px-3">
        <nav className="space-y-0.5">
          {navItems.map((item) => (
            <NavItemRow
              key={item.title}
              item={item}
              pathname={pathname}
              openItems={openItems}
              toggleItem={toggleItem}
              onNavigate={onNavigate}
            />
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="shrink-0 border-t border-border/60 p-3 space-y-1">
        {/* User info */}
        {user && (
          <>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-accent/50 mb-2">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.name} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{user.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{roleLabel}</p>
              </div>
            </div>
            <Separator className="mb-1 opacity-50" />
          </>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground h-9"
          asChild
        >
          <Link href="/" onClick={onNavigate}>
            <Home className="h-4 w-4" />
            Volver al sitio
          </Link>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground h-9"
          aria-label={theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
        >
          {theme === "light" ? (
            <><Moon className="h-4 w-4" /><span>Modo oscuro</span></>
          ) : (
            <><Sun className="h-4 w-4" /><span>Modo claro</span></>
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive h-9"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  )
}

export function AdminSidebar() {
  const [mounted, setMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex h-screen w-60 flex-col bg-background/95 backdrop-blur-sm border-r border-border/60 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile: top bar + sheet */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex h-14 items-center gap-3 px-4 bg-background/95 backdrop-blur-sm border-b border-border/60">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-60 p-0 border-r border-border/60">
            <VisuallyHidden>
              <SheetTitle>Menú de navegación</SheetTitle>
            </VisuallyHidden>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
            <span className="text-[11px] font-bold text-primary-foreground">T</span>
          </div>
          <span className="text-sm font-semibold">Techno Espacio</span>
        </Link>
      </div>
    </>
  )
}
