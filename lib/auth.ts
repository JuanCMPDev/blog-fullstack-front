import { create } from "zustand"
import { persist } from "zustand/middleware"
import { AuthState, User, UserRole } from "@/lib/types"

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user, isLoading: false }),
      isAdmin: () => get().user?.role === "admin",
      isEditor: () => get().user?.role === "editor",
      logout: () => set({ user: null }),
    }),
    {
      name: "auth-storage",
    },
  ),
)

// Esta función simula una llamada a la API para obtener el usuario actual
export const fetchCurrentUser = async (): Promise<User | null> => {
  // Simular una demora de red
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Simular un usuario autenticado (en una aplicación real, esto vendría de tu backend)
  return {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    role: UserRole.Editor,
    avatar: "/placeholder.svg?height=40&width=40",
    nick: "admin_user",
  }
}

