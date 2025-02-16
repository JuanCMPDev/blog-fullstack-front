"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

const emailSchema = z.object({
  email: z.string().email({
    message: "Por favor, introduce un email válido.",
  }),
})

export function RequestResetPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: z.infer<typeof emailSchema>) {
    setIsLoading(true)
    try {
      // Simulate API call
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      })

      if (response.status === 201) {
        const data = await response.json()
        if (data.message === "Correo de recuperación enviado") {
          toast({
            title: "Correo enviado",
            description: "Se ha enviado un correo con las instrucciones para restablecer tu contraseña.",
          })
        } else {
          throw new Error("Respuesta inesperada del servidor")
        }
      } else {
        throw new Error("Error al enviar el correo de recuperación")
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
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
                  <Input type="email" placeholder="tu@ejemplo.com" {...field} className="pl-10" />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enviar correo de recuperación
        </Button>
      </form>
    </Form>
  )
}

