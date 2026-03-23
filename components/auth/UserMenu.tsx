import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UserCircle, LogOut, LayoutDashboard, ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth"
import { getAvatarUrl } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { createLogger } from "@/lib/logger"

const logger = createLogger("UserMenu")

interface UserMenuProps {
  user: {
    name: string
    email: string
    avatar?: string
    nick: string
    role: string
  }
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { logout } = useAuth()
  const router = useRouter()

  logger.debug("Estado inicial de UserMenu", {
    role: user.role,
    nick: user.nick,
  })

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const menuItems = [
    { icon: UserCircle, label: "Perfil", href: `/profile/${user.nick}` },
    ...(user.role === "admin" || user.role === "editor"
      ? [{
          icon: LayoutDashboard,
          label: "Dashboard",
          href: "/admin"
        }]
      : []),
  ]

  logger.debug("Items de menú calculados", {
    showDashboard: user.role === "admin" || user.role === "editor",
    itemsCount: menuItems.length,
  })

  const handleNavigation = (href: string) => {
    setIsOpen(false)
    router.push(href)
  }

  const handleLogout = () => {
    setIsOpen(false)
    logout()
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="relative h-9 w-9 rounded-full overflow-hidden focus:outline-none ring-2 ring-transparent hover:ring-primary/40 focus:ring-primary transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar className="h-full w-full">
          <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.name} />
          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-sm font-bold">
            {user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-64 rounded-xl border border-border/30 bg-background/95 backdrop-blur-xl shadow-xl shadow-black/10 dark:shadow-black/30 overflow-hidden"
          >
            {/* User info header */}
            <div className="px-4 py-3 border-b border-border/20">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-sm font-bold">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-headline font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1.5 px-1.5">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleNavigation(item.href)}
                  className="flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-primary/5 transition-colors duration-150 group"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary/50 group-hover:bg-primary/10 transition-colors duration-150">
                    <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                </button>
              ))}
            </div>

            {/* Logout */}
            <div className="py-1.5 px-1.5 border-t border-border/20">
              <button
                onClick={handleLogout}
                className="flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-red-500/5 transition-colors duration-150 group"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/5 group-hover:bg-red-500/10 transition-colors duration-150">
                  <LogOut className="h-4 w-4 text-red-500/70 group-hover:text-red-500 transition-colors" />
                </div>
                <span className="flex-1 text-left font-medium text-red-500/70 group-hover:text-red-500 transition-colors">Cerrar sesión</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
