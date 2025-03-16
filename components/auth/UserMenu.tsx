import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UserCircle, Settings, LogOut, LayoutDashboard } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"

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
  const [isAnimating, setIsAnimating] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { logout } = useAuth()
  const router = useRouter()

  // Logs para verificar el role
  console.log("UserMenu recibió user:", user);
  console.log("UserMenu role:", user.role);

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
    { icon: Settings, label: "Configuración", href: "/settings" },
    // Asegurarse de que la condición funcione comprobando directamente con el string
    ...(user.role === "admin" || user.role === "editor"
      ? [{ 
          icon: LayoutDashboard, 
          label: "Dashboard", 
          href: "/admin" 
        }]
      : []),
  ]

  console.log("¿Mostrar Dashboard?:", user.role === "admin" || user.role === "editor");
  console.log("Menu items:", menuItems);

  // Función para manejar la navegación y cerrar el menú
  const handleNavigation = (href: string) => {
    // Iniciar animación
    setIsAnimating(true)
    
    // Cerrar el menú
    setIsOpen(false)
    
    // Navegar después de un pequeño retraso para que se vea la animación
    setTimeout(() => {
      router.push(href)
      
      // Terminar la animación después de la navegación
      setTimeout(() => {
        setIsAnimating(false)
      }, 600)
    }, 300)
  }
  
  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    setIsAnimating(true)
    setIsOpen(false)
    
    setTimeout(() => {
      logout()
      
      setTimeout(() => {
        setIsAnimating(false)
      }, 600)
    }, 300)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        className={`relative h-10 w-10 ${isAnimating ? 'ring-4 ring-primary transition-all duration-700' : ''} rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-300 ease-in-out transform hover:scale-110`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar className="h-full w-full">
          <AvatarImage src={user.avatar || "/placeholder-user.jpg"} alt={user.name} />
          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
            {user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg overflow-hidden"
            style={{
              background: "linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--accent)) 100%)",
            }}
          >
            <div className="px-4 py-4 bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-sm">
              <p className="text-lg font-semibold text-foreground">{user.name}</p>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            </div>
            <div className="py-2">
              {menuItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleNavigation(item.href)}
                  className="flex items-center px-4 py-3 text-sm text-foreground hover:bg-accent/50 transition-colors duration-150 group cursor-pointer"
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 group-hover:bg-primary/20 mr-3 transition-colors duration-150">
                    <item.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </span>
                  <span className="font-medium">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="py-2 bg-gradient-to-r from-destructive/10 to-destructive/20 backdrop-blur-sm">
              <div
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-3 text-sm text-foreground hover:bg-destructive/20 transition-colors duration-150 group cursor-pointer"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-destructive/10 group-hover:bg-destructive/30 mr-3 transition-colors duration-150">
                  <LogOut className="h-5 w-5 text-destructive" aria-hidden="true" />
                </span>
                <span className="font-medium">Cerrar sesión</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
