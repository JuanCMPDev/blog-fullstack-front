"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import type React from "react"
import { ProtectedRouteProps } from "@/lib/types"

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter()
  const { user, isLoading, refreshAccessToken } = useAuth()
  const [isVerifying, setIsVerifying] = useState(true)
  const [refreshAttempted, setRefreshAttempted] = useState(false)

  useEffect(() => {
    let isMounted = true;
    
    async function verifyAuth() {
      if (!isMounted) return;
      
      // Si ya verificamos y hay un usuario, simplemente mostramos el contenido
      if (user && !isLoading) {
        setIsVerifying(false);
        return;
      }
      
      // Si estamos cargando, esperamos
      if (isLoading) return;
      
      // Si no hay usuario y no hemos intentado refrescar, lo intentamos
      if (!user && !refreshAttempted) {
        setRefreshAttempted(true);
        try {
          console.log("Intentando refrescar token...");
          await refreshAccessToken();
          // Esperamos un poco para que se actualice el estado
          setTimeout(() => {
            if (isMounted) {
              setIsVerifying(false);
            }
          }, 500);
        } catch (error) {
          console.error("Error refreshing token:", error);
          if (isMounted) {
            setIsVerifying(false);
          }
        }
      } else {
        // Si ya intentamos refrescar o hay algún error, terminamos la verificación
        setIsVerifying(false);
      }
    }

    verifyAuth();
    
    return () => {
      isMounted = false;
    };
  }, [user, isLoading, refreshAccessToken, refreshAttempted]);

  // Efecto separado para la redirección
  useEffect(() => {
    // Solo redirigimos cuando no estamos verificando ni cargando
    // y sabemos con certeza que el usuario no tiene acceso
    if (!isVerifying && !isLoading && (!user || !allowedRoles.includes(user.role))) {
      console.log("Redireccionando a home por falta de permisos...");
      router.push("/");
    }
  }, [user, isLoading, router, allowedRoles, isVerifying]);

  // Mostrar spinner mientras verificamos la autenticación
  if (isLoading || isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
        <span className="ml-2 text-muted-foreground">Verificando autenticación...</span>
      </div>
    );
  }

  // Si el usuario no tiene permisos, no renderizar nada mientras redirige
  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  // Si el usuario tiene permisos, mostrar el contenido protegido
  return <>{children}</>;
}

