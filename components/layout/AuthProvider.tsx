"use client";

import { ReactNode, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { customFetch } from "@/lib/customFetch";

export function AuthProvider({ children }: { children: ReactNode }) {
  const refreshAccessToken = useAuth((state) => state.refreshAccessToken);
  const accessToken = useAuth((state) => state.accessToken);
  const user = useAuth((state) => state.user);
  const setUser = useAuth((state) => state.setUser);
  const logout = useAuth((state) => state.logout);

  // Función para verificar si el usuario tiene cambios (ban o cambio de rol)
  const checkUserStatus = useCallback(async () => {
    if (!user || !accessToken) return;
    
    try {
      const response = await customFetch(
        `${process.env.NEXT_PUBLIC_API_URL}profile/${user.userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
        }
      );
      
      if (!response.ok) {
        // Si el usuario no existe o está baneado, cerramos sesión
        if (response.status === 403 || response.status === 404) {
          console.log("Usuario no disponible o baneado, cerrando sesión...");
          logout();
        }
        return;
      }
      
      const userData = await response.json();
      
      // Verificar si hay diferencias en el rol u otras propiedades importantes
      if (userData.role !== user.role) {
        console.log("Cambios detectados en el rol del usuario, actualizando...");
        setUser({
          ...user,
          role: userData.role
        });
      }
    } catch (error) {
      console.error("Error al verificar estado del usuario:", error);
    }
  }, [user, accessToken, logout, setUser]);

  useEffect(() => {
    // Refrescar el token cada 15 minutos, solo si hay un accessToken válido
    const tokenInterval = setInterval(() => {
      if (accessToken) {
        refreshAccessToken();
      }
    }, 15 * 60 * 1000); // 15 minutos
    
    // Verificar el estado del usuario cada 5 minutos
    const userStatusInterval = setInterval(() => {
      if (user && accessToken) {
        checkUserStatus();
      }
    }, 5 * 60 * 1000); // 5 minutos
    
    // Verificación inicial del estado del usuario
    if (user && accessToken) {
      checkUserStatus();
    }
    
    return () => {
      clearInterval(tokenInterval);
      clearInterval(userStatusInterval);
    };
  }, [refreshAccessToken, accessToken, user, checkUserStatus]);

  return <>{children}</>;
}
