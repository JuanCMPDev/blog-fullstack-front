"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import type React from "react" // Added import for React
import { ProtectedRouteProps } from "@/lib/types"

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && (!user || !allowedRoles.includes(user.role))) {
      router.push("/") // Redirige a la página principal si no está autorizado
    }
  }, [user, isLoading, router, allowedRoles])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return null // No renderiza nada mientras redirige
  }

  return <>{children}</>
}

