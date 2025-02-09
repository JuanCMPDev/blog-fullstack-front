"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  type LucideIcon,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface NavItem {
  title: string
  href?: string
  icon: LucideIcon
  subItems?: NavItem[]
}

const sidebarNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Dashboard,
  },
  {
    title: "Usuarios",
    icon: Users,
    subItems: [{ title: "Administrar Usuarios", href: "/admin/users", icon: UserPlus }],
  },
  {
    title: "Posts",
    icon: FileText,
    subItems: [
      { title: "Crear Post", href: "/admin/posts/create", icon: PenSquare },
      { title: "Administrar Posts", href: "/admin/posts", icon: ListTodo },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const [openItems, setOpenItems] = useState<string[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const toggleItem = (title: string) => {
    setOpenItems((prevOpenItems) =>
      prevOpenItems.includes(title) ? prevOpenItems.filter((item) => item !== title) : [...prevOpenItems, title],
    )
  }

  const NavItem = ({ item, depth = 0 }: { item: NavItem; depth?: number }) => {
    const isActive = item.href === pathname
    const hasSubItems = item.subItems && item.subItems.length > 0
    const isOpen = openItems.includes(item.title)

    if (hasSubItems) {
      return (
        <Collapsible open={isOpen} onOpenChange={() => toggleItem(item.title)}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-start",
                isOpen
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon className="h-5 w-5 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium flex-grow text-left">{item.title}</span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "transform rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-4 space-y-1 mt-1">
            {item.subItems?.map((subItem) => (
              <NavItem key={subItem.href} item={subItem} depth={depth + 1} />
            ))}
          </CollapsibleContent>
        </Collapsible>
      )
    }

    return (
      <Link
        href={item.href || "#"}
        className={cn(
          "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        )}
      >
        <item.icon className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-medium">{item.title}</span>
      </Link>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="hidden lg:flex h-screen w-64 flex-col bg-background border-r"
    >
      <div className="flex h-16 items-center justify-center bg-accent/50">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">A</span>
          </div>
          <span className="text-lg font-semibold text-primary">Panel de Admin</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 py-4 px-3">
        <nav className="space-y-1">
          {sidebarNavItems.map((item) => (
            <NavItem key={item.title} item={item} />
          ))}
        </nav>
      </ScrollArea>
      <div className="border-t border-border p-4 space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start hover:bg-accent hover:text-accent-foreground transition-colors"
          asChild
        >
          <Link href="/" className="flex items-center space-x-3">
            <Home className="h-4 w-4" />
            <span className="text-sm">Volver al sitio</span>
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="w-full justify-start hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {theme === "light" ? (
            <>
              <Moon className="h-4 w-4 mr-3" />
              <span className="text-sm">Modo oscuro</span>
            </>
          ) : (
            <>
              <Sun className="h-4 w-4 mr-3" />
              <span className="text-sm">Modo claro</span>
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <LogOut className="h-4 w-4 mr-3" />
          <span className="text-sm">Cerrar sesión</span>
        </Button>
      </div>
    </motion.div>
  )
}

