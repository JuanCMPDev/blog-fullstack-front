"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  HelpCircle,
  Search,
  X,
  ArrowLeft,
  MessageSquare,
  BookOpen,
  UserPlus,
  Gift,
  Users,
  Bug,
  Smartphone,
  Award,
  CalendarClock,
} from "lucide-react"

const faqs = [
  {
    id: "q1",
    question: "¿Qué es Techno Espacio?",
    answer:
      "Techno Espacio es una plataforma educativa dedicada a compartir conocimientos sobre tecnología, programación, desarrollo web y otros temas relacionados con el mundo digital. Nuestro objetivo es proporcionar contenido de calidad para ayudar a profesionales y entusiastas a mantenerse actualizados en el cambiante panorama tecnológico.",
    icon: BookOpen,
    category: "general",
  },
  {
    id: "q2",
    question: "¿Cómo puedo crear una cuenta?",
    answer:
      "Para crear una cuenta en Techno Espacio, simplemente haz clic en el botón 'Registrarse' en la parte superior derecha de la página. Completa el formulario con tu información personal y sigue las instrucciones para verificar tu cuenta. Una vez registrado, podrás acceder a funciones adicionales como guardar artículos favoritos, comentar y más.",
    icon: UserPlus,
    category: "cuenta",
  },
  {
    id: "q3",
    question: "¿Los contenidos son gratuitos?",
    answer:
      "Sí, todos los artículos y recursos educativos publicados en Techno Espacio son completamente gratuitos. Creemos en el acceso libre al conocimiento. Sin embargo, en el futuro podríamos ofrecer cursos o contenido premium con características adicionales.",
    icon: Gift,
    category: "general",
  },
  {
    id: "q4",
    question: "¿Puedo contribuir con contenido?",
    answer:
      "¡Absolutamente! Si eres un experto en algún tema tecnológico y deseas compartir tu conocimiento, puedes contactarnos a través de nuestro formulario de contacto. Evaluaremos tu propuesta y, si es aprobada, podrás convertirte en colaborador de nuestra plataforma.",
    icon: Users,
    category: "general",
  },
  {
    id: "q5",
    question: "¿Cómo puedo reportar un error o problema en el sitio?",
    answer:
      "Si encuentras algún error técnico o problema en nuestro sitio, por favor utiliza la página de contacto para informarnos. Proporciona detalles específicos sobre el problema, incluyendo la URL donde ocurrió, los pasos para reproducirlo y capturas de pantalla si es posible. Nuestro equipo técnico lo revisará lo antes posible.",
    icon: Bug,
    category: "soporte",
  },
  {
    id: "q6",
    question: "¿Tienen aplicación móvil?",
    answer:
      "Actualmente no contamos con una aplicación móvil, pero nuestro sitio web está completamente optimizado para dispositivos móviles. Puedes acceder a todo nuestro contenido desde tu smartphone o tablet con una experiencia de usuario fluida y adaptada.",
    icon: Smartphone,
    category: "general",
  },
  {
    id: "q7",
    question: "¿Ofrecen certificados por completar cursos?",
    answer:
      "Por el momento no ofrecemos certificados oficiales. Sin embargo, estamos trabajando en implementar un sistema de certificación para futuros cursos y programas educativos. Te mantendremos informado a través de nuestro boletín cuando esta característica esté disponible.",
    icon: Award,
    category: "cursos",
  },
  {
    id: "q8",
    question: "¿Con qué frecuencia publican nuevo contenido?",
    answer:
      "Publicamos nuevo contenido regularmente, con al menos 2-3 artículos nuevos cada semana. Nuestro equipo editorial trabaja constantemente para mantener el contenido actualizado y relevante para nuestros usuarios.",
    icon: CalendarClock,
    category: "general",
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredFaqs = useMemo(() => {
    if (!searchTerm.trim()) return faqs
    const term = searchTerm.toLowerCase()
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(term) ||
        faq.answer.toLowerCase().includes(term)
    )
  }, [searchTerm])

  return (
    <div className="min-h-screen bg-dot-pattern">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 pt-16 pb-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Link>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 ring-1 ring-primary/20">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Preguntas Frecuentes
                </h1>
                <p className="text-muted-foreground mt-1">
                  Respuestas a las dudas más comunes sobre la plataforma
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar en las preguntas frecuentes..."
              className="pl-10 h-11 bg-card/80 border-border/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {searchTerm && (
            <p className="text-sm text-muted-foreground mt-2 ml-1">
              {filteredFaqs.length}{" "}
              {filteredFaqs.length === 1 ? "resultado" : "resultados"} para
              &ldquo;{searchTerm}&rdquo;
            </p>
          )}
        </motion.div>

        {/* FAQ List */}
        {filteredFaqs.length > 0 ? (
          <motion.div variants={container} initial="hidden" animate="show">
            <Accordion type="single" collapsible className="space-y-3">
              {filteredFaqs.map((faq) => {
                const Icon = faq.icon
                return (
                  <motion.div key={faq.id} variants={item}>
                    <AccordionItem
                      value={faq.id}
                      className="border border-border/50 rounded-xl px-5 bg-card/60 backdrop-blur-sm shadow-sm data-[state=open]:shadow-md data-[state=open]:border-primary/20 transition-all"
                    >
                      <AccordionTrigger className="text-left py-4 gap-3 hover:no-underline [&[data-state=open]>div>svg]:text-primary">
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon className="h-5 w-5 text-muted-foreground shrink-0 transition-colors" />
                          <span className="font-medium text-[15px]">
                            {faq.question}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-5 pl-8 text-[14px] leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                )
              })}
            </Accordion>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Search className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Sin resultados
            </h3>
            <p className="text-muted-foreground mb-6 text-sm">
              No hay preguntas que coincidan con tu búsqueda.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchTerm("")}
            >
              Limpiar búsqueda
            </Button>
          </motion.div>
        )}

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 p-6 rounded-xl bg-card/60 border border-border/50 text-center"
        >
          <MessageSquare className="h-8 w-8 text-primary mx-auto mb-3" />
          <h3 className="font-semibold mb-1">
            ¿No encuentras lo que buscas?
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Escríbenos y te responderemos lo antes posible.
          </p>
          <Button asChild size="sm">
            <Link href="/contact">Ir a Contacto</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
