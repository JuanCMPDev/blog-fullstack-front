"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to error reporting service in production
    if (process.env.NODE_ENV === "production") {
      // TODO: Send to Sentry/DataDog/etc.
    }
  }, [error])

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12 bg-dot-pattern">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md text-center"
      >
        <div className="rounded-2xl border border-border/50 bg-background/80 backdrop-blur-sm shadow-xl p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full ring-4 ring-red-500/20 bg-background shadow-sm mb-6">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight mb-2">Algo salió mal</h1>
          <p className="text-muted-foreground mb-6">
            Ha ocurrido un error inesperado. Puedes intentar recargar la página o volver al inicio.
          </p>

          {error.digest && (
            <p className="text-xs text-muted-foreground/50 mb-6 font-mono">
              Referencia: {error.digest}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button onClick={reset} className="gap-2 w-full sm:w-auto">
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
            <Button variant="outline" asChild className="gap-2 w-full sm:w-auto">
              <Link href="/">
                <Home className="h-4 w-4" />
                Ir al inicio
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
