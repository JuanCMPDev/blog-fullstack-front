"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Loader2 } from "lucide-react"

export default function ProfileIndexPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    // Si no está cargando y hay un usuario autenticado, redirigir a su perfil
    if (!isLoading) {
      if (user) {
        router.push(`/profile/${user.nick}`)
      } else {
        // Si no hay usuario autenticado, redirigir al login
        router.push("/signin?redirect=/profile")
      }
    }
  }, [user, isLoading, router])

  // Mostrar un indicador de carga mientras decidimos a dónde redirigir
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Redirigiendo...</p>
    </div>
  )
} 