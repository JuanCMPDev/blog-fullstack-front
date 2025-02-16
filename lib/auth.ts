import { create } from "zustand"
import { persist } from "zustand/middleware"
import { AuthState, User, UserRole } from "@/lib/types"
import { decodeJwt } from "jose"

interface JWTPayload {
  id: string
  role: string
  iat: number
  exp: number
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: false,

      setUser: (user: User | null) => set({ user }),

      // Login: se obtiene el access token y luego se llama a la API para obtener los datos completos del usuario
      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const loginResponse = await fetch(
            process.env.NEXT_PUBLIC_API_URL + "auth/login",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
              credentials: "include", // Para manejar la cookie del refresh token
            }
          )
          if (!loginResponse.ok) {
            const errorData = await loginResponse.json()
            throw new Error(errorData.message || "Error en el login")
          }
          const loginData = await loginResponse.json()
          const { accessToken } = loginData

          // Decodifica el token para obtener el ID del usuario
          const decoded = decodeJwt(accessToken) as JWTPayload

          // Llama a la API para obtener los datos completos del usuario usando el ID del token
          const userResponse = await fetch(
            process.env.NEXT_PUBLIC_API_URL + `users/${decoded.id}`,
            {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${accessToken}`,
              },
              credentials: "include",
            }
          )
          if (!userResponse.ok) {
            throw new Error("Error al obtener los datos del usuario")
          }
          const userData = await userResponse.json()

          const roleMapping: Record<string, UserRole> = {
            "user": UserRole.User,
            "admin": UserRole.Admin,
            "editor": UserRole.Editor,
          }
          const normalizedRole = roleMapping[(userData.role as string).toLocaleLowerCase()]
            const normalizedUser: User = {
              ...userData,
              role: normalizedRole,
            }
          
          set({
            user: normalizedUser,
            accessToken,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      // Método para refrescar el access token
      refreshAccessToken: async () => {
        try {
          const refreshResponse = await fetch(
            process.env.NEXT_PUBLIC_API_URL + "auth/refresh-token",
            {
              method: "POST",
              credentials: "include",
            }
          )
          if (!refreshResponse.ok) {
            throw new Error("Error al refrescar el token: " + refreshResponse.statusText)
          }
          const refreshData = await refreshResponse.json()
          set({ accessToken: refreshData.accessToken })
        } catch (error) {
          console.error("Error refreshing token:", error)
          set({ user: null, accessToken: null })
        }
      },

      logout: async () => {
        await fetch(process.env.NEXT_PUBLIC_API_URL + "auth/logout", {
          method: "POST",
          credentials: "include",
        })
        set({ user: null, accessToken: null })
      },

      isAdmin: () => get().user?.role.toLowerCase() === "admin",
      isEditor: () => get().user?.role.toLowerCase() === "editor",
    }),
    {
      name: "auth-storage",
    }
  )
)
