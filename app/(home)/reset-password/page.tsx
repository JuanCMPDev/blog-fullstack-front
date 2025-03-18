"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { RequestResetPassword } from "@/components/auth/RequestResetPassword"
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm"

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token")
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
    }
  }, [searchParams])

  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4 py-8 bg-dot-pattern">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md my-auto relative z-10"
      >
        <Card className="border-none shadow-lg bg-background/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              {token ? "Restablecer contraseña" : "Solicitar restablecimiento de contraseña"}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 py-4">
            {token ? <ResetPasswordForm token={token} /> : <RequestResetPassword />}
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              ¿Recordaste tu contraseña?{" "}
              <Link href="/signin" className="font-medium text-primary hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Cargando...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}

