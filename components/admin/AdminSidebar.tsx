"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FileText, Users, Settings, Home, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"

const sidebarNavItems = [
  {
    title: "Panel",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Entradas",
    href: "/admin/posts",
    icon: FileText,
  },
  {
    title: "Usuarios",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Configuración",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  return (
    <div className="hidden border-r bg-background lg:block">
      <div className="flex h-full max-h-screen flex-col">
        <div className="flex h-[60px] items-center border-b px-6">
          <Link className="flex items-center gap-2 font-semibold" href="/admin">
            <LayoutDashboard className="h-6 w-6" />
            <span className="text-foreground">Panel de Admin</span>
          </Link>
        </div>
        <ScrollArea className="flex-1">
          <nav className="grid items-start px-4 py-4">
            {sidebarNavItems.map((item, index) => (
              <Link key={index} href={item.href}>
                <span
                  className={cn(
                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium",
                    "hover:bg-accent hover:text-accent-foreground",
                    pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                    "cursor-pointer",
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                </span>
              </Link>
            ))}
          </nav>
        </ScrollArea>
        <div className="border-t p-4">
          <div className="flex flex-col gap-4">
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start">
                <Home className="mr-2 h-4 w-4" />
                Volver al inicio
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
              {theme === "light" ? "Modo oscuro" : "Modo claro"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

