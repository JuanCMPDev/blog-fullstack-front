import { create } from "zustand"
import { persist } from "zustand/middleware"
import { AuthState, UserProfile, UserRole } from "@/lib/types"
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

      setUser: (user: UserProfile | null) => set({ user }),

      setAccessToken: (token: string | null) => set({ accessToken: token }),

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
            process.env.NEXT_PUBLIC_API_URL + `profile/${decoded.id}`,
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
          const normalizedRole = roleMapping[(decoded.role as string).toLocaleLowerCase()]
          const normalizedUser: UserProfile = {
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
              credentials: "include", // 🔥 Solo usa la cookie del refresh token, no el accessToken
            }
          )

          if (!refreshResponse.ok) {
            throw new Error("Error al refrescar el token: " + refreshResponse.statusText)
          }

          const refreshData = await refreshResponse.json()
          const newAccessToken = refreshData.accessToken

          set({ accessToken: newAccessToken }) // 🔥 Actualiza el estado global de Zustand
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

      updateAvatar: async (file: File) => {
        const { user, accessToken, setUser } = get()
        if (!user || !accessToken) {
          console.error("Usuario no autenticado o sin token.")
          return
        }

        const formData = new FormData()
        formData.append("file", file)

        try {
          const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "users/avatar", {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            body: formData,
          })

          if (!response.ok) {
            throw new Error("Error al actualizar el avatar")
          }

          // 🔥 Refrescar el avatar en el estado de Zustand con un nuevo timestamp
          const newAvatarUrl = `${process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN}/${user.id}-${Date.now()}.png`
          setUser({ ...user, avatar: newAvatarUrl })

        } catch (error) {
          console.error("Error actualizando avatar:", error)
        }
      },

      isAdmin: () => get().user?.role.toLowerCase() === "admin",
      isEditor: () => get().user?.role.toLowerCase() === "editor",
    }),
    {
      name: "auth-storage",
    }
  )
)
