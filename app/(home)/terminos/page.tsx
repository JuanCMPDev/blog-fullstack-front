"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Scale,
  Sparkles,
  FileText,
  User,
  Copyright,
  MessageSquare,
  LinkIcon,
  ShieldAlert,
  HelpCircle,
  RefreshCw,
  XCircle,
  GavelIcon as GavelSquare,
  ChevronLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import Link from "next/link"

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const sections = [
  {
    id: "acceptance",
    title: "1. Aceptación de los Términos",
    icon: <FileText className="h-5 w-5" />,
    content: (
      <p>
        Al acceder o utilizar Techno Espacio, aceptas cumplir y estar sujeto a estos Términos de Uso. Si no estás de
        acuerdo con alguna parte de estos términos, no podrás acceder al servicio.
      </p>
    ),
  },
  {
    id: "description",
    title: "2. Descripción del Servicio",
    icon: <HelpCircle className="h-5 w-5" />,
    content: (
      <p>
        Techno Espacio es una plataforma educativa que proporciona contenido relacionado con tecnología, programación,
        desarrollo web y otros temas del ámbito digital. Nuestros servicios pueden incluir, entre otros, artículos,
        tutoriales, cursos y recursos educativos.
      </p>
    ),
  },
  {
    id: "accounts",
    title: "3. Cuentas de Usuario",
    icon: <User className="h-5 w-5" />,
    content: (
      <>
        <p className="mb-4">
          Algunas funciones de nuestro servicio requieren el registro de una cuenta. Al registrarte, aceptas
          proporcionar información precisa, completa y actualizada. Eres responsable de mantener la confidencialidad de
          tu contraseña y de todas las actividades que ocurran bajo tu cuenta.
        </p>
        <p>
          Nos reservamos el derecho de suspender o terminar tu cuenta si consideramos que has violado estos términos o
          si tu comportamiento es perjudicial para nuestra plataforma o para otros usuarios.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "4. Propiedad Intelectual",
    icon: <Copyright className="h-5 w-5" />,
    content: (
      <>
        <p className="mb-4">
          Todo el contenido presente en Techno Espacio, incluyendo textos, gráficos, logos, iconos, imágenes, clips de
          audio, descargas digitales y software, es propiedad de Techno Espacio o de nuestros proveedores de contenido y
          está protegido por leyes de propiedad intelectual.
        </p>
        <p>
          El uso no autorizado de nuestro contenido puede constituir una violación de las leyes de derechos de autor,
          marcas registradas, y otras leyes de propiedad intelectual.
        </p>
      </>
    ),
  },
  {
    id: "user-content",
    title: "5. Contenido del Usuario",
    icon: <MessageSquare className="h-5 w-5" />,
    content: (
      <>
        <p className="mb-4">
          Nuestro servicio puede permitirte publicar, enlazar, almacenar, compartir y de otra manera poner a disposición
          cierto contenido, incluyendo mensajes, comentarios, imágenes y otros materiales.
        </p>
        <p className="mb-4">
          Al proporcionar contenido a través de nuestro servicio, otorgas a Techno Espacio una licencia mundial, no
          exclusiva, libre de regalías, transferible y sublicenciable para usar, reproducir, modificar, adaptar,
          publicar, traducir, distribuir y mostrar dicho contenido.
        </p>
        <p>
          Eres el único responsable del contenido que publicas y de las consecuencias de compartirlo. No publicarás
          contenido que sea ilegal, fraudulento, engañoso, difamatorio, obsceno, pornográfico, o que infrinja derechos
          de terceros.
        </p>
      </>
    ),
  },
  {
    id: "links",
    title: "6. Enlaces a Otros Sitios Web",
    icon: <LinkIcon className="h-5 w-5" />,
    content: (
      <>
        <p className="mb-4">
          Nuestro servicio puede contener enlaces a sitios web de terceros que no son propiedad ni están controlados por
          Techno Espacio. No tenemos control sobre, y no asumimos responsabilidad por, el contenido, políticas de
          privacidad, o prácticas de sitios web de terceros.
        </p>
        <p>
          Reconoces y aceptas que Techno Espacio no será responsable, directa o indirectamente, por cualquier daño o
          pérdida causados o supuestamente causados por o en conexión con el uso o la confianza en cualquier contenido,
          bienes o servicios disponibles en o a través de tales sitios web.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    title: "7. Limitación de Responsabilidad",
    icon: <ShieldAlert className="h-5 w-5" />,
    content: (
      <p>
        En ningún caso Techno Espacio, sus directores, empleados, socios, agentes, proveedores o afiliados serán
        responsables por cualquier daño indirecto, incidental, especial, consecuente o punitivo, incluyendo sin
        limitación, pérdida de beneficios, datos, uso, buena voluntad, u otras pérdidas intangibles.
      </p>
    ),
  },
  {
    id: "indemnification",
    title: "8. Indemnización",
    icon: <GavelSquare className="h-5 w-5" />,
    content: (
      <p>
        Aceptas defender, indemnizar y mantener indemne a Techno Espacio y a sus licenciantes, empleados, contratistas,
        agentes, funcionarios y directores, de y contra cualquier reclamo, daños, obligaciones, pérdidas,
        responsabilidades, costos o deudas, y gastos (incluyendo pero no limitado a honorarios de abogados) que surjan
        de: (i) tu uso y acceso al Servicio; (ii) tu violación de estos Términos; (iii) tu violación de cualquier
        derecho de terceros, incluidos sin limitación cualquier derecho de autor, propiedad o privacidad.
      </p>
    ),
  },
  {
    id: "changes",
    title: "9. Cambios en los Términos",
    icon: <RefreshCw className="h-5 w-5" />,
    content: (
      <>
        <p className="mb-4">
          Nos reservamos el derecho, a nuestra sola discreción, de modificar o reemplazar estos Términos en cualquier
          momento. Si una revisión es material, intentaremos proporcionar al menos 30 días de aviso antes de que los
          nuevos términos entren en vigencia.
        </p>
        <p>
          Al continuar accediendo o utilizando nuestro Servicio después de que las revisiones entren en vigencia,
          aceptas estar sujeto a los términos revisados.
        </p>
      </>
    ),
  },
  {
    id: "termination",
    title: "10. Terminación",
    icon: <XCircle className="h-5 w-5" />,
    content: (
      <p>
        Podemos terminar o suspender tu acceso inmediatamente, sin previo aviso o responsabilidad, por cualquier razón,
        incluyendo sin limitación si incumples los Términos. Tras la terminación, tu derecho a utilizar el Servicio
        cesará inmediatamente.
      </p>
    ),
  },
  {
    id: "law",
    title: "11. Ley Aplicable",
    icon: <GavelSquare className="h-5 w-5" />,
    content: (
      <p>
        Estos Términos se regirán e interpretarán de acuerdo con las leyes colombianas, sin dar efecto a ningún
        principio de conflictos de leyes.
      </p>
    ),
  },
  {
    id: "contact",
    title: "12. Contacto",
    icon: <MessageSquare className="h-5 w-5" />,
    content: (
      <p>
        Si tienes alguna pregunta sobre estos Términos, por favor contáctanos a través de nuestra{" "}
        <a href="/contact" className="text-primary hover:underline">
          página de contacto
        </a>
        .
      </p>
    ),
  },
]

export default function TermsOfServicePage() {
  const [viewMode, setViewMode] = useState<"full" | "accordion" | "tabs">("full")

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />

      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-70 animate-blob" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-secondary/10 rounded-full blur-3xl opacity-70 animate-blob animation-delay-2000" />

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
                <Scale className="h-10 w-10 text-primary" />
              </div>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-4 tracking-tight">Términos de Uso</h1>

          <div className="relative inline-block mt-2 mb-6">
            <Sparkles className="absolute -top-4 -left-6 h-6 w-6 text-primary animate-pulse" />
            <p className="text-xl md:text-2xl text-muted-foreground">Condiciones para el uso de nuestra plataforma</p>
            <Sparkles className="absolute -bottom-4 -right-6 h-6 w-6 text-primary animate-pulse" />
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Button variant={viewMode === "full" ? "default" : "outline"} size="sm" onClick={() => setViewMode("full")}>
              Vista completa
            </Button>
            <Button
              variant={viewMode === "accordion" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("accordion")}
            >
              Acordeón
            </Button>
            <Button variant={viewMode === "tabs" ? "default" : "outline"} size="sm" onClick={() => setViewMode("tabs")}>
              Pestañas
            </Button>
          </div>
        </motion.div>

        <motion.div className="max-w-4xl mx-auto" variants={staggerContainer} initial="initial" animate="animate">
          <Card className="shadow-lg border border-border/40 backdrop-blur-sm bg-card/95 overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/40">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Scale className="h-6 w-6 text-primary" />
                Términos y Condiciones de Techno Espacio
              </CardTitle>
              <CardDescription>
                Última actualización:{" "}
                {new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-8 px-4 md:px-6">
              {viewMode === "full" && (
                <div className="space-y-8">
                  {sections.map((section, index) => (
                    <motion.section
                      key={section.id}
                      variants={fadeInUp}
                      className={cn(
                        "pb-8", // Increased padding
                        index < sections.length - 1 && "border-b border-border/40",
                      )}
                    >
                      <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2 text-foreground">
                        {section.icon}
                        {section.title}
                      </h2>
                      <div className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        {" "}
                        {/* Added responsive text size and line height */}
                        {section.content}
                      </div>
                    </motion.section>
                  ))}
                </div>
              )}

              {viewMode === "accordion" && (
                <Accordion type="single" collapsible className="w-full">
                  {sections.map((section) => (
                    <AccordionItem key={section.id} value={section.id}>
                      <AccordionTrigger className="flex items-center gap-2 text-base md:text-lg py-5">
                        {" "}
                        {/* Increased font size and padding */}
                        {section.icon}
                        <span>{section.title}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-sm md:text-base text-muted-foreground leading-relaxed pb-6">
                        {" "}
                        {/* Added responsive text size, line height and padding */}
                        {section.content}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}

              {viewMode === "tabs" && (
                <Tabs defaultValue={sections[0].id} className="w-full">
                  <TabsList className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 mb-6">
                    {sections.map((section, index) => (
                      <TabsTrigger
                        key={section.id}
                        value={section.id}
                        className="flex flex-col items-center gap-1 p-2 h-auto"
                        title={section.title}
                      >
                        {section.icon}
                        <span className="hidden md:inline text-xs">{index + 1}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {sections.map((section) => (
                    <TabsContent
                      key={section.id}
                      value={section.id}
                      className="text-sm md:text-base text-muted-foreground leading-relaxed"
                    >
                      {" "}
                      {/* Added responsive text size and line height */}
                      <h3 className="text-lg md:text-xl font-semibold mb-4 text-foreground">{section.title}</h3>
                      {section.content}
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-muted/20 border-t border-border/40 py-4">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <ChevronLeft className="mr-2 h-4 w-4" />
                <Link href="/">Volver</Link>
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Al usar nuestros servicios, confirmas que has leído, entendido y aceptado estos términos.
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

