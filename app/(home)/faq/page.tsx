"use client"

import { motion } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HelpCircle, Sparkles, Search, X, MessageSquare, ChevronLeft } from "lucide-react"
import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import Link from "next/link"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

// Lista de preguntas frecuentes
const faqs = [
  {
    id: "q1",
    question: "¿Qué es Techno Espacio?",
    answer:
      "Techno Espacio es una plataforma educativa dedicada a compartir conocimientos sobre tecnología, programación, desarrollo web y otros temas relacionados con el mundo digital. Nuestro objetivo es proporcionar contenido de calidad para ayudar a profesionales y entusiastas a mantenerse actualizados en el cambiante panorama tecnológico.",
  },
  {
    id: "q2",
    question: "¿Cómo puedo crear una cuenta?",
    answer:
      "Para crear una cuenta en Techno Espacio, simplemente haz clic en el botón 'Registrarse' en la parte superior derecha de la página. Completa el formulario con tu información personal y sigue las instrucciones para verificar tu cuenta. Una vez registrado, podrás acceder a funciones adicionales como guardar artículos favoritos, comentar y más.",
  },
  {
    id: "q3",
    question: "¿Los contenidos son gratuitos?",
    answer:
      "Sí, todos los artículos y recursos educativos publicados en Techno Espacio son completamente gratuitos. Creemos en el acceso libre al conocimiento. Sin embargo, en el futuro podríamos ofrecer cursos o contenido premium con características adicionales.",
  },
  {
    id: "q4",
    question: "¿Puedo contribuir con contenido?",
    answer:
      "¡Absolutamente! Si eres un experto en algún tema tecnológico y deseas compartir tu conocimiento, puedes contactarnos a través de nuestro formulario de contacto. Evaluaremos tu propuesta y, si es aprobada, podrás convertirte en colaborador de nuestra plataforma.",
  },
  {
    id: "q5",
    question: "¿Cómo puedo reportar un error o problema en el sitio?",
    answer:
      "Si encuentras algún error técnico o problema en nuestro sitio, por favor utiliza la página de contacto para informarnos. Proporciona detalles específicos sobre el problema, incluyendo la URL donde ocurrió, los pasos para reproducirlo y capturas de pantalla si es posible. Nuestro equipo técnico lo revisará lo antes posible.",
  },
  {
    id: "q6",
    question: "¿Tienen aplicación móvil?",
    answer:
      "Actualmente no contamos con una aplicación móvil, pero nuestro sitio web está completamente optimizado para dispositivos móviles. Puedes acceder a todo nuestro contenido desde tu smartphone o tablet con una experiencia de usuario fluida y adaptada.",
  },
  {
    id: "q7",
    question: "¿Ofrecen certificados por completar cursos?",
    answer:
      "Por el momento no ofrecemos certificados oficiales. Sin embargo, estamos trabajando en implementar un sistema de certificación para futuros cursos y programas educativos. Te mantendremos informado a través de nuestro boletín cuando esta característica esté disponible.",
  },
  {
    id: "q8",
    question: "¿Con qué frecuencia publican nuevo contenido?",
    answer:
      "Publicamos nuevo contenido regularmente, con al menos 2-3 artículos nuevos cada semana. Nuestro equipo editorial trabaja constantemente para mantener el contenido actualizado y relevante para nuestros usuarios.",
  }
]

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("")

  // Filtrar preguntas basadas en el término de búsqueda
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      return (
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
  }, [searchTerm])

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-70 animate-blob" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-secondary/10 rounded-full blur-3xl opacity-70 animate-blob animation-delay-2000" />

      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-md transform scale-110" />
              <div className="relative bg-card p-3 rounded-full shadow-lg">
                <HelpCircle className="h-10 w-10 text-primary" />
              </div>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-4 tracking-tight">
            Preguntas Frecuentes
          </h1>

          <div className="relative inline-block mt-2 mb-6">
            <Sparkles className="absolute -top-4 -left-6 h-6 w-6 text-primary animate-pulse" />
            <p className="text-xl md:text-2xl text-muted-foreground">Respuestas a tus dudas más comunes</p>
            <Sparkles className="absolute -bottom-4 -right-6 h-6 w-6 text-primary animate-pulse" />
          </div>
        </motion.div>

        <motion.div
          className="max-w-4xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar en las preguntas frecuentes..."
              className="pl-10 py-4 md:py-6 text-base md:text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </motion.div>

        <motion.div className="max-w-4xl mx-auto" variants={staggerContainer} initial="initial" animate="animate">
          <Card className="shadow-lg border border-border/40 backdrop-blur-sm bg-card/95 overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/40">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-primary" />
                Preguntas y Respuestas
              </CardTitle>
              <CardDescription>
                {filteredFaqs.length} {filteredFaqs.length === 1 ? "pregunta encontrada" : "preguntas encontradas"}
                {searchTerm && (
                  <>
                    {" "}
                    para &quot;<span className="font-medium">{searchTerm}</span>&quot;
                  </>
                )}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-8 px-4 md:px-6">
              {filteredFaqs.length > 0 ? (
                <Accordion type="single" collapsible className="space-y-4">
                  {filteredFaqs.map((faq) => (
                    <motion.div key={faq.id} variants={fadeInUp}>
                      <AccordionItem value={faq.id} className="border border-border rounded-lg px-4">
                        <AccordionTrigger className="text-left font-medium py-5 text-base md:text-lg">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-6 pt-2 text-sm md:text-base leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    </motion.div>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-16">
                  <HelpCircle className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
                  <h3 className="text-xl md:text-2xl font-medium mb-4">No se encontraron resultados</h3>
                  <p className="text-base md:text-lg text-muted-foreground mb-6">
                    No hay preguntas que coincidan con tu búsqueda. Intenta con otros términos.
                  </p>
                  <Button variant="outline" size="lg" onClick={() => setSearchTerm("")}>
                    Limpiar búsqueda
                  </Button>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-muted/20 border-t border-border/40 py-4">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <ChevronLeft className="mr-2 h-4 w-4" />
                <Link href="/">Volver</Link>
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                ¿No encuentras respuesta a tu pregunta?{" "}
                <a href="/contact" className="text-primary hover:underline">
                  Contáctanos
                </a>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

