"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { Loader2, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useAuth } from "@/lib/auth"
import { customFetch } from "@/lib/customFetch"
import { buildApiUrl } from "@/lib/api"
import { useReCaptcha } from "@/components/common/RecaptchaProvider"

const formSchema = z.object({
  email: z.string().email({
    message: "Por favor, introduce un email válido.",
  }),
  password: z.string().min(8, {
    message: "La contraseña debe tener al menos 8 caracteres.",
  }),
})

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { login } = useAuth()
  const { executeRecaptcha } = useReCaptcha()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      // Se utiliza el método login del store, que se encarga de la llamada a la API
      await login(values.email, values.password)
      // Luego de iniciar sesión, redirige a la ruta deseada (por ejemplo, dashboard)
      router.push("/")
    } catch (error: unknown) {
      const msg = (error as Error).message
      if (msg.includes("verificar tu email") || msg.includes("verify")) {
        setNeedsVerification(true)
      }
      toast({
        title: "Error de inicio de sesión",
        description: msg,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResendVerification() {
    const email = form.getValues("email")
    if (!email) {
      toast({ title: "Ingresa tu email primero", variant: "destructive" })
      return
    }
    setResendingEmail(true)
    try {
      const recaptchaValue = executeRecaptcha ? await executeRecaptcha("resend_verification") : ""
      const res = await customFetch(buildApiUrl("auth/resend-verification"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, recaptchaValue }),
      })
      if (res.ok) {
        toast({
          title: "Email enviado",
          description: "Revisa tu bandeja de entrada para el enlace de verificación.",
          duration: 8000,
        })
      } else {
        toast({ title: "No se pudo reenviar el email", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error de conexión", variant: "destructive" })
    } finally {
      setResendingEmail(false)
    }
  }

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
              Inicia sesión en tu cuenta
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 py-4">
            {needsVerification && (
              <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1 text-sm">
                  <p className="font-medium text-amber-700 dark:text-amber-400">Email no verificado</p>
                  <p className="text-muted-foreground mt-0.5">Revisa tu bandeja de entrada o&nbsp;
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendingEmail}
                      className="underline font-medium text-primary hover:text-primary/80 disabled:opacity-50"
                    >
                      {resendingEmail ? "enviando..." : "reenviar el email de verificación"}
                    </button>.
                  </p>
                </div>
              </div>
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input placeholder="tu@ejemplo.com" {...field} className="pl-10" />
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="********"
                            {...field}
                            className="pl-10 pr-10"
                          />
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                      <div className="text-right">
                        <Link
                          href="/reset-password"
                          className="text-xs text-muted-foreground hover:text-primary transition-colors"
                          aria-label="Recuperar contraseña olvidada"
                        >
                          ¿Olvidaste tu contraseña?
                        </Link>
                      </div>
                    </FormItem>
                  )}
                />
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Iniciar sesión
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-4">
            <p className="text-sm text-muted-foreground">
              ¿No tienes una cuenta?{" "}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Regístrate aquí
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
