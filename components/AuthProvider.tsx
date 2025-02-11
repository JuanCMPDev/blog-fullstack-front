"use client"

import { type ReactNode, useEffect } from "react"
import { useAuth, fetchCurrentUser } from "@/lib/auth"

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser } = useAuth()

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await fetchCurrentUser()
        setUser(user)
      } catch (error) {
        console.error("Failed to load user:", error)
        setUser(null)
      }
    }

    loadUser()
  }, [setUser])

  return <>{children}</>
}

