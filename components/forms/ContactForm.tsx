"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, MessageSquare, Send } from "lucide-react"
import { customFetch } from "@/lib/customFetch"

const sendContactForm = async (data: {
  name: string;
  email: string;
  message: string;
}) => {
  const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Error al enviar el mensaje');
  }

  return response.json();
};

const formSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor, introduce un email válido.",
  }),
  message: z.string().min(10, {
    message: "El mensaje debe tener al menos 10 caracteres.",
  }),
})

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showEmail, setShowEmail] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const [showButton, setShowButton] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  })

  useEffect(() => {
    if (!showForm) return

    const nameSubscription = form.watch((value, { name }) => {
      if (name === "name" && value.name && value.name.length >= 2) {
        setTimeout(() => setShowEmail(true), 500)
      }
    })

    const emailSubscription = form.watch((value, { name }) => {
      if (name === "email" && value.email && value.email.includes("@")) {
        setTimeout(() => setShowMessage(true), 500)
      }
    })

    const messageSubscription = form.watch((value, { name }) => {
      if (name === "message" && value.message && value.message.length >= 10) {
        setTimeout(() => setShowButton(true), 500)
      }
    })

    return () => {
      nameSubscription.unsubscribe()
      emailSubscription.unsubscribe()
      messageSubscription.unsubscribe()
    }
  }, [form.watch, showForm])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      await sendContactForm(values)
      toast({
        title: "Mensaje enviado",
        description: "Gracias por contactarme. Te responderé lo antes posible.",
      })
      form.reset()
      setShowEmail(false)
      setShowMessage(false)
      setShowButton(false)
      setShowForm(false)
    } catch {
      toast({
        title: "Error",
        description: "Hubo un problema al enviar el mensaje. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence mode="wait">
      {!showForm ? (
        <motion.div
          key="contact-button"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            onClick={() => setShowForm(true)}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-300 rounded-md py-2 px-4 text-sm font-medium"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Iniciar conversación
          </Button>
        </motion.div>
      ) : (
        <motion.div
          key="contact-form"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5 }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key="name"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-medium text-foreground">Nombre</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Tu nombre"
                            {...field}
                            className="bg-transparent border-none focus:ring-0 rounded-lg p-3 transition-all duration-300 placeholder-muted-foreground/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                {showEmail && (
                  <motion.div
                    key="email"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-medium text-foreground">Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="tu@ejemplo.com"
                              {...field}
                              className="bg-transparent border-none focus:ring-0 rounded-lg p-3 transition-all duration-300 placeholder-muted-foreground/50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

                {showMessage && (
                  <motion.div
                    key="message"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-medium text-foreground">Mensaje</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Escribe tu mensaje aquí"
                              className="resize-none bg-transparent border-none focus:ring-0 rounded-lg p-3 transition-all duration-300 placeholder-muted-foreground/50 min-h-[150px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

                {showButton && (
                  <motion.div
                    key="button"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-300 rounded-md py-2 px-4 text-sm font-medium"
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
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </Form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

