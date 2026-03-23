import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { AuthState, UserProfile, UserRole } from "@/lib/types"
import { decodeJwt } from "jose"
import { buildApiUrl, extractApiErrorMessageFromResponse } from "@/lib/api"
import { extractAvatarUrlFromPayload } from "@/lib/profile-adapter"

interface JWTPayload {
  id: string
  role: string
  iat: number
  exp: number
}

function roleStringToEnum(role: string): UserRole {
  switch (role) {
    case "admin": return UserRole.Admin
    case "editor": return UserRole.Editor
    default: return UserRole.User
  }
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: false,

      setUser: (user: UserProfile | null) => set({ user }),

      setAccessToken: (token: string | null) => set({ accessToken: token }),

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const loginResponse = await fetch(
            buildApiUrl("auth/login"),
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
              credentials: "include",
            }
          )
          if (!loginResponse.ok) {
            const message = await extractApiErrorMessageFromResponse(loginResponse, "Error en el login")
            throw new Error(message)
          }
          const loginData = await loginResponse.json()
          const { accessToken } = loginData

          const decoded = decodeJwt(accessToken) as JWTPayload

          const userResponse = await fetch(
            buildApiUrl(`profile/${decoded.id}`),
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

          const jwtRole = decoded.role.toLowerCase()
          const roleEnum = roleStringToEnum(jwtRole)

          const user: UserProfile = {
            userId: userData.userId || decoded.id,
            name: userData.name || "",
            bio: userData.bio || "",
            email: userData.email || "",
            nick: userData.nick || "",
            avatar: userData.avatar || "",
            coverImage: userData.coverImage || "",
            location: userData.location || "",
            joinDate: userData.joinDate || new Date().toISOString(),
            socialLinks: userData.socialLinks || {},
            skills: userData.skills || [],
            role: roleEnum,
            roleAsString: jwtRole
          };

          set({
            user,
            accessToken,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      refreshAccessToken: async () => {
        try {
          const refreshResponse = await fetch(
            buildApiUrl("auth/refresh-token"),
            {
              method: "POST",
              credentials: "include",
            }
          )

          if (!refreshResponse.ok) {
            throw new Error("Error al refrescar el token: " + refreshResponse.statusText)
          }

          const refreshData = await refreshResponse.json()
          const newAccessToken = refreshData.accessToken

          const decoded = decodeJwt(newAccessToken) as JWTPayload
          const jwtRole = decoded.role.toLowerCase()
          const roleEnum = roleStringToEnum(jwtRole)

          const { user } = get()
          if (user) {
            set({
              user: { ...user, role: roleEnum, roleAsString: jwtRole },
              accessToken: newAccessToken,
            })
          }
        } catch {
          set({ user: null, accessToken: null })
        }
      },

      logout: async () => {
        await fetch(buildApiUrl("auth/logout"), {
          method: "POST",
          credentials: "include",
        })
        set({ user: null, accessToken: null })
      },

      updateAvatar: async (file: File) => {
        const { user, accessToken, setUser } = get()
        if (!user || !accessToken) return

        const formData = new FormData()
        formData.append("file", file)

        try {
          const response = await fetch(buildApiUrl("users/avatar"), {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            body: formData,
          })

          if (!response.ok) {
            throw new Error("Error al actualizar el avatar")
          }

          const payload = await response.json()
          const newAvatarUrl = extractAvatarUrlFromPayload(payload)
          if (newAvatarUrl) {
            setUser({ ...user, avatar: newAvatarUrl })
          }
        } catch {
          // Silently fail — UI will show stale avatar
        }
      },

      isAdmin: () => {
        const user = get().user;
        if (!user) return false;
        const role = user.roleAsString || (user.role === UserRole.Admin ? "admin" : "");
        return role === "admin";
      },
      isEditor: () => {
        const user = get().user;
        if (!user) return false;
        const role = user.roleAsString || (user.role === UserRole.Editor ? "editor" : "");
        return role === "editor";
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user ? {
          ...state.user,
          role: state.user.roleAsString,
          roleAsString: state.user.roleAsString
        } : null,
        accessToken: state.accessToken
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.user?.roleAsString) {
          state.user.role = roleStringToEnum(state.user.roleAsString);
        }
      }
    }
  )
)
