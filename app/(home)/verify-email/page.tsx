"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight, RefreshCw, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { customFetch } from "@/lib/customFetch"
import { buildApiUrl } from "@/lib/api"

type Status = "loading" | "success" | "error" | "no-token"

const statusConfig = {
  loading: {
    icon: Loader2,
    iconClass: "text-primary animate-spin",
    bgGradient: "from-primary/10 via-primary/5 to-transparent",
    ringColor: "ring-primary/20",
  },
  success: {
    icon: CheckCircle2,
    iconClass: "text-emerald-500",
    bgGradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    ringColor: "ring-emerald-500/20",
  },
  error: {
    icon: XCircle,
    iconClass: "text-red-500",
    bgGradient: "from-red-500/10 via-red-500/5 to-transparent",
    ringColor: "ring-red-500/20",
  },
  "no-token": {
    icon: Mail,
    iconClass: "text-muted-foreground",
    bgGradient: "from-muted/50 via-muted/20 to-transparent",
    ringColor: "ring-border",
  },
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [status, setStatus] = useState<Status>(token ? "loading" : "no-token")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) return

    const verify = async () => {
      try {
        const res = await customFetch(buildApiUrl("auth/verify-email"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })
        const data = await res.json()
        if (res.ok) {
          setStatus("success")
          setMessage(data.message || "Email verificado correctamente.")
        } else {
          setStatus("error")
          setMessage(data.message || "No se pudo verificar el email.")
        }
      } catch {
        setStatus("error")
        setMessage("Error de conexión. Inténtalo de nuevo más tarde.")
      }
    }

    verify()
  }, [token])

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4 py-12 bg-dot-pattern">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg my-auto relative z-10"
      >
        <div className="relative rounded-2xl border border-border/50 bg-background/80 backdrop-blur-sm shadow-xl overflow-hidden">
          {/* Gradient top accent */}
          <div className={`absolute inset-x-0 top-0 h-48 bg-gradient-to-b ${config.bgGradient} pointer-events-none`} />

          <div className="relative px-8 pt-12 pb-10 text-center">
            {/* Icon with animated ring */}
            <AnimatePresence mode="wait">
              <motion.div
                key={status}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                className="mx-auto mb-6"
              >
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ring-4 ${config.ringColor} bg-background shadow-sm`}>
                  <Icon className={`h-10 w-10 ${config.iconClass}`} />
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Title */}
            <AnimatePresence mode="wait">
              <motion.h1
                key={`title-${status}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold tracking-tight mb-3"
              >
                {status === "loading" && "Verificando tu email..."}
                {status === "success" && "Email verificado"}
                {status === "error" && "No se pudo verificar"}
                {status === "no-token" && "Enlace incompleto"}
              </motion.h1>
            </AnimatePresence>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground leading-relaxed max-w-sm mx-auto"
            >
              {status === "loading" && "Estamos confirmando tu dirección de email. Solo tomará un momento..."}
              {status === "success" && message}
              {status === "error" && message}
              {status === "no-token" && "No encontramos un token de verificación en la URL. Asegúrate de usar el enlace completo del email que recibiste."}
            </motion.p>

            {/* Success extras */}
            {status === "success" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20"
              >
                <div className="flex items-center justify-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="font-medium">Tu cuenta está activa y lista para usar</span>
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              {status === "success" && (
                <Button asChild size="lg" className="gap-2 w-full sm:w-auto">
                  <Link href="/signin">
                    Iniciar sesión
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}

              {status === "error" && (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 w-full sm:w-auto"
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reintentar
                  </Button>
                  <Button variant="ghost" size="lg" asChild className="w-full sm:w-auto">
                    <Link href="/signin">Ir al inicio de sesión</Link>
                  </Button>
                </>
              )}

              {status === "no-token" && (
                <Button variant="outline" size="lg" asChild className="gap-2 w-full sm:w-auto">
                  <Link href="/signin">
                    Ir al inicio de sesión
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </motion.div>
          </div>
        </div>

        {/* Help text */}
        {(status === "error" || status === "no-token") && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-xs text-muted-foreground/60 mt-4"
          >
            Si sigues teniendo problemas, puedes solicitar un nuevo enlace de verificación desde la página de inicio de sesión.
          </motion.p>
        )}
      </motion.div>
    </div>
  )
}
