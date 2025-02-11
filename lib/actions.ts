"use server"

import { z } from "zod"

const formSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
})

export async function sendContactForm(formData: z.infer<typeof formSchema>) {
  const result = formSchema.safeParse(formData)

  if (!result.success) {
    throw new Error("Datos de formulario inválidos")
  }

  // Here you would typically send an email or store the message in a database
  // For this example, we'll just log the data
  console.log("Formulario de contacto recibido:", result.data)

  // Simulate a delay to mimic an API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return { success: true }
}

