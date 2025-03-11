"use client";

import { ReactNode, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { customFetch } from "@/lib/customFetch";
import { UserRole } from "@/lib/types";

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
      // Usar el endpoint específico para estado del usuario que incluye info de ban y rol
      const response = await customFetch(
        `${process.env.NEXT_PUBLIC_API_URL}auth/user-status`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
        }
      );
      
      if (!response.ok) {
        // Si hay algún problema con la autenticación, cerramos sesión
        if (response.status === 401 || response.status === 403) {
          console.log("Sesión inválida, cerrando sesión...");
          logout();
        }
        return;
      }
      
      const userData = await response.json();
      
      // Verificar si el usuario está baneado
      if (userData.isBanned) {
        console.log("Usuario baneado, cerrando sesión...");
        logout();
        return;
      }
      
      // Verificar si hay diferencias en el rol
      if (userData.roleAsString !== user.roleAsString) {
        console.log("Cambios detectados en el rol del usuario, actualizando...");
        console.log("Rol actual:", user.roleAsString, "Nuevo rol:", userData.roleAsString);
        
        // Convertir roleAsString a enum UserRole para mantener el tipado
        const roleEnum = 
          userData.roleAsString.toLowerCase() === "admin" ? UserRole.Admin : 
          userData.roleAsString.toLowerCase() === "editor" ? UserRole.Editor : 
          UserRole.User;
        
        // Solo actualizamos las propiedades relacionadas con el rol
        const updatedUser = {
          ...user,
          role: roleEnum,
          roleAsString: userData.roleAsString
        };
        
        // Realizar la actualización
        setUser(updatedUser);
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
