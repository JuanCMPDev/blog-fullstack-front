"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { Loader2, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth"
import { User, UserRole } from "@/lib/types"
import { useRouter} from 'next/navigation'

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
  const { toast } = useToast()
  const setUser = useAuth((state) => state.setUser)
  const router = useRouter()


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })
  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    // Simula una llamada a la API con un tiempo de espera
    setTimeout(() => {
      setIsLoading(false)

      // Simula la respuesta de la API
      const fakeUser: User = {
        id: "123",
        nick: "jcdev",
        name: "Juan Carlos Dev",
        email: data.email,
        role: "admin" as UserRole,
        avatar: "/placeholder.svg?height=40&width=40",
      }

      setUser(fakeUser)

      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido de vuelta, ${fakeUser.name}!`,
      })

      // Redirige a la página de inicio
      router.push("/")
     
    }, 2000)
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
            <CardTitle className="text-2xl font-bold text-center">Inicia sesión en tu cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                          <Input type="password" placeholder="********" {...field} className="pl-10" />
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage />
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
          <CardFooter className="flex justify-center">
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

