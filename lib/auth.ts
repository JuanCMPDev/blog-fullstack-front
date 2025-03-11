import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
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

          // Extraer el role directamente del JWT
          const jwtRole = decoded.role.toLowerCase()
          console.log("Decoded JWT role:", jwtRole);
          
          // Convertir string a enum para la asignaciu00f3n de tipo
          const roleEnum = 
            jwtRole === "admin" ? UserRole.Admin : 
            jwtRole === "editor" ? UserRole.Editor : 
            UserRole.User;
          
          console.log("Role como enum:", roleEnum, "Tipo:", typeof roleEnum);
          
          // Crear objeto completo con todas las propiedades, guardando el role como string y como enum
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
          
          console.log("Usuario completo:", JSON.stringify(user));
          
          // Prueba directa
          try {
            localStorage.setItem('direct-test', JSON.stringify({ 
              roleEnum,
              roleAsString: jwtRole,
              // Usamos la propiedad correcta del enum
              roleEnumValue: roleEnum,
              check: { role: roleEnum }
            }));
            const test = JSON.parse(localStorage.getItem('direct-test') || '{}');
            console.log("Prueba directa:", test);
          } catch (e) {
            console.error("Error en prueba directa:", e);
          }
          
          // Actualizar el estado con todas las propiedades
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

          // Decodificar el token para extraer el role
          const decoded = decodeJwt(newAccessToken) as JWTPayload
          const jwtRole = decoded.role.toLowerCase()
          
          console.log("JWT Role en refresh:", jwtRole);
          
          // Convertir el string a enum para tipo
          const roleEnum = 
            jwtRole === "admin" ? UserRole.Admin : 
            jwtRole === "editor" ? UserRole.Editor : 
            UserRole.User;

          console.log("Role como enum en refresh:", roleEnum);
          
          // Actualizar el token y el role del usuario
          const { user } = get()
          if (user) {
            // Actualizar el usuario con ambas propiedades de role
            const updatedUser: UserProfile = {
              ...user,
              role: roleEnum,           // Para tipado correcto
              roleAsString: jwtRole     // Para persistencia
            };
            
            console.log("Usuario actualizado con role:", updatedUser);
            
            // Actualizar el estado
            set({ 
              user: updatedUser,
              accessToken: newAccessToken,
            })
          }
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
          const newAvatarUrl = `${process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN}/${user.userId}-${Date.now()}.png`
          setUser({ ...user, avatar: newAvatarUrl })

        } catch (error) {
          console.error("Error actualizando avatar:", error)
        }
      },

      isAdmin: () => {
        const user = get().user;
        if (!user) return false;
        
        // Usamos roleAsString para comparaciones directas
        const role = user.roleAsString || (user.role === UserRole.Admin ? "admin" : "");
        console.log("Role en isAdmin:", role);
        return role === "admin";
      },
      isEditor: () => {
        const user = get().user;
        if (!user) return false;
        
        // Usamos roleAsString para comparaciones directas
        const role = user.roleAsString || (user.role === UserRole.Editor ? "editor" : "");
        console.log("Role en isEditor:", role);
        return role === "editor";
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        console.log("Persistiendo estado:", state);
        return {
          user: state.user ? {
            ...state.user,
            // Asegurarse de que role y roleAsString se guardan correctamente
            role: state.user.roleAsString, // Guardar el role como string en localStorage
            roleAsString: state.user.roleAsString
          } : null,
          accessToken: state.accessToken
        };
      },
      onRehydrateStorage: () => (state) => {
        // Cuando se recarga la pu00e1gina y se restaura el estado desde localStorage
        console.log("Estado rehidratado:", state);
        if (state && state.user && state.user.roleAsString) {
          // Convertir de nuevo el string a enum
          const roleEnum = 
            state.user.roleAsString === "admin" ? UserRole.Admin : 
            state.user.roleAsString === "editor" ? UserRole.Editor : 
            UserRole.User;
          
          // Actualizar el usuario con el enum correcto
          state.user.role = roleEnum;
          console.log("Usuario rehidratado con role corregido:", state.user);
        }
      }
    }
  )
)
