"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Send, CheckCircle2 } from "lucide-react"
import { customFetch } from "@/lib/customFetch"
import { buildApiUrl, extractApiErrorMessageFromResponse } from "@/lib/api"
import { useReCaptcha } from "@/components/common/RecaptchaProvider"

const SUBJECT_OPTIONS = [
  { value: "propuesta", label: "Propuesta de proyecto" },
  { value: "consulta", label: "Consulta técnica" },
  { value: "colaboracion", label: "Colaboración" },
  { value: "bug", label: "Reporte de error" },
  { value: "otro", label: "Otro" },
] as const

const MESSAGE_MAX_LENGTH = 1000
const NAME_MAX_LENGTH = 80

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres." })
    .max(NAME_MAX_LENGTH, { message: `Máximo ${NAME_MAX_LENGTH} caracteres.` }),
  email: z
    .string()
    .email({ message: "Por favor, introduce un email válido." }),
  subject: z
    .string()
    .min(1, { message: "Selecciona un tema." }),
  message: z
    .string()
    .min(10, { message: "El mensaje debe tener al menos 10 caracteres." })
    .max(MESSAGE_MAX_LENGTH, { message: `Máximo ${MESSAGE_MAX_LENGTH} caracteres.` }),
  // Honeypot field - should remain empty
  website: z.string().max(0).optional(),
})

type FormValues = z.infer<typeof formSchema>

async function sendContactForm(data: {
  name: string
  email: string
  message: string
  recaptchaValue: string
}) {
  const response = await customFetch(buildApiUrl("contact"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const message = await extractApiErrorMessageFromResponse(response, "Error al enviar el mensaje")
    throw new Error(message)
  }

  return response.json()
}

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()
  const { executeRecaptcha } = useReCaptcha()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      website: "",
    },
  })

  const messageValue = form.watch("message")
  const messageLength = messageValue?.length || 0

  async function onSubmit(values: FormValues) {
    // Honeypot check
    if (values.website && values.website.length > 0) return

    if (!executeRecaptcha) {
      toast({
        title: "Error",
        description: "El sistema de verificación no está listo. Intenta de nuevo en unos segundos.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const recaptchaToken = await executeRecaptcha("contact_form")

      if (!recaptchaToken) {
        throw new Error("No se pudo verificar que eres humano. Recarga la página e intenta de nuevo.")
      }

      // Prepend subject to message for backend compatibility
      const subjectLabel = SUBJECT_OPTIONS.find(o => o.value === values.subject)?.label || values.subject
      const fullMessage = `[${subjectLabel}]\n\n${values.message}`

      await sendContactForm({
        name: values.name,
        email: values.email,
        message: fullMessage,
        recaptchaValue: recaptchaToken,
      })

      setIsSuccess(true)
      form.reset()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Hubo un problema al enviar el mensaje."
      toast({
        title: "Error al enviar",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence mode="wait">
      {isSuccess ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="text-xl font-headline font-bold mb-2">Mensaje enviado</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Gracias por contactarme. Revisaré tu mensaje y te responderé lo antes posible.
          </p>
          <Button
            variant="outline"
            onClick={() => setIsSuccess(false)}
            className="border-primary/30 hover:bg-primary/10"
          >
            Enviar otro mensaje
          </Button>
        </motion.div>
      ) : (
        <motion.div
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Tu nombre"
                          maxLength={NAME_MAX_LENGTH}
                          className="bg-secondary/30 border-border/30 focus:border-primary/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="tu@ejemplo.com"
                          className="bg-secondary/30 border-border/30 focus:border-primary/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tema *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-secondary/30 border-border/30 focus:border-primary/50">
                          <SelectValue placeholder="Selecciona un tema" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SUBJECT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Mensaje *</FormLabel>
                      <span className={`text-xs ${messageLength > MESSAGE_MAX_LENGTH * 0.9 ? "text-destructive" : "text-muted-foreground"}`}>
                        {messageLength}/{MESSAGE_MAX_LENGTH}
                      </span>
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="Describe tu consulta o propuesta..."
                        maxLength={MESSAGE_MAX_LENGTH}
                        className="resize-none bg-secondary/30 border-border/30 focus:border-primary/50 min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Honeypot - invisible to users, traps bots */}
              <div className="absolute -left-[9999px]" aria-hidden="true" tabIndex={-1}>
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input tabIndex={-1} autoComplete="off" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full font-semibold"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar mensaje
                  </>
                )}
              </Button>

              <p className="text-[11px] text-muted-foreground/60 text-center">
                Protegido por reCAPTCHA. Se aplican la{" "}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-muted-foreground">
                  Política de Privacidad
                </a>{" "}y los{" "}
                <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-muted-foreground">
                  Términos de Servicio
                </a>{" "}de Google.
              </p>
            </form>
          </Form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
