import { create } from "zustand"
import { persist } from "zustand/middleware"
import { AuthState, UserRole } from "@/lib/types"

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: {
        id: "1",
        nick: "user",
        name: "Admin User",
        email: "admin@example.com",
        role: "user" as UserRole,
        avatar: "/placeholder.svg?height=40&width=40",
      },
      setUser: (user) => set({ user }),
      isAdmin: () => get().user?.role === "admin",
      logout: () => set({ user: null }),
    }),
    {
      name: "auth-storage",
    },
  ),
)

// Esta función simula una llamada a la API para obtener el usuario actual
//export const fetchCurrentUser = async (): Promise<User | null> => {
//  // Simular una demora de red
//  await new Promise((resolve) => setTimeout(resolve, 1000))
//
//  // Simular un usuario autenticado (en una aplicación real, esto vendría de tu backend)
//  return {
//    id: "1",
//    name: "Admin User",
//    email: "admin@example.com",
//    role: "admin",
//    avatar: "/placeholder.svg?height=40&width=40",
//  }
//}

