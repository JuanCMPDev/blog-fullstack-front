"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Shield,
  Sparkles,
  Lock,
  FileText,
  Info,
  Database,
  Share2,
  UserCheck,
  ShieldCheck,
  RefreshCw,
  MessageSquare,
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
    id: "introduction",
    title: "1. Introducción",
    icon: <Info className="h-5 w-5" />,
    content: (
      <>
        <p className="mb-4">
          En Techno Espacio, nos comprometemos a proteger la privacidad de nuestros usuarios. Esta Política de
          Privacidad describe cómo recopilamos, usamos, procesamos y compartimos tu información personal cuando utilizas
          nuestro sitio web y servicios.
        </p>
        <p>
          Al utilizar Techno Espacio, aceptas las prácticas descritas en esta Política de Privacidad. Te recomendamos
          leer este documento detenidamente para comprender nuestras políticas y prácticas con respecto a tu información
          personal.
        </p>
      </>
    ),
  },
  {
    id: "data-collection",
    title: "2. Información que recopilamos",
    icon: <Database className="h-5 w-5" />,
    content: (
      <>
        <p className="mb-4">Podemos recopilar los siguientes tipos de información:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Información personal identificable:</strong> Nombre, dirección de correo electrónico, nombre de
            usuario y fotografía de perfil cuando te registras en nuestra plataforma.
          </li>
          <li>
            <strong>Información de uso:</strong> Datos sobre cómo interactúas con nuestro sitio, incluyendo las páginas
            que visitas, el tiempo que pasas en ellas y las funciones que utilizas.
          </li>
          <li>
            <strong>Información técnica:</strong> Dirección IP, tipo de navegador, proveedor de servicios de Internet,
            identificadores de dispositivos, sistema operativo y otra información técnica.
          </li>
          <li>
            <strong>Cookies y tecnologías similares:</strong> Utilizamos cookies y tecnologías similares para recopilar
            información sobre tu actividad, navegador y dispositivo.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "data-usage",
    title: "3. Cómo utilizamos tu información",
    icon: <FileText className="h-5 w-5" />,
    content: (
      <>
        <p className="mb-4">Utilizamos la información que recopilamos para:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Proporcionar, mantener y mejorar nuestros servicios</li>
          <li>Procesar y completar transacciones</li>
          <li>Enviar información técnica, actualizaciones, alertas de seguridad y mensajes de soporte</li>
          <li>Responder a tus comentarios, preguntas y solicitudes</li>
          <li>Desarrollar nuevos productos y servicios</li>
          <li>Personalizar tu experiencia</li>
          <li>Proteger contra actividades fraudulentas y abusos</li>
          <li>Cumplir con obligaciones legales</li>
        </ul>
      </>
    ),
  },
  {
    id: "data-sharing",
    title: "4. Compartir tu información",
    icon: <Share2 className="h-5 w-5" />,
    content: (
      <>
        <p className="mb-4">
          No vendemos tu información personal a terceros. Sin embargo, podemos compartir tu información en las
          siguientes circunstancias:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Con proveedores de servicios que nos ayudan a operar nuestro sitio</li>
          <li>Con tu consentimiento o según tus instrucciones</li>
          <li>Para cumplir con leyes, regulaciones o procesos legales</li>
          <li>En relación con una fusión, venta de activos o transacción financiera</li>
          <li>Para proteger los derechos, propiedad o seguridad de Techno Espacio y nuestros usuarios</li>
        </ul>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "5. Tus derechos y opciones",
    icon: <UserCheck className="h-5 w-5" />,
    content: (
      <>
        <p className="mb-4">
          Dependiendo de tu ubicación, puedes tener ciertos derechos con respecto a tu información personal, incluyendo:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Acceder a tu información personal</li>
          <li>Corregir datos inexactos</li>
          <li>Eliminar tu información</li>
          <li>Oponerte al procesamiento de tus datos</li>
          <li>Exportar tus datos en un formato portátil</li>
          <li>Retirar tu consentimiento en cualquier momento</li>
        </ul>
        <p className="mt-4">
          Para ejercer estos derechos, contáctanos a través de nuestra{" "}
          <a href="/contact" className="text-primary hover:underline">
            página de contacto
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "6. Seguridad de la información",
    icon: <ShieldCheck className="h-5 w-5" />,
    content: (
      <p>
        Implementamos medidas de seguridad diseñadas para proteger tu información personal contra acceso no autorizado,
        uso o divulgación. Sin embargo, ningún sistema es completamente seguro, y no podemos garantizar la seguridad
        absoluta de tu información.
      </p>
    ),
  },
  {
    id: "changes",
    title: "7. Cambios a esta política",
    icon: <RefreshCw className="h-5 w-5" />,
    content: (
      <p>
        Podemos actualizar esta Política de Privacidad periódicamente. Te notificaremos sobre cambios significativos
        mediante un aviso visible en nuestro sitio o por correo electrónico. Te recomendamos revisar esta política
        regularmente.
      </p>
    ),
  },
  {
    id: "contact",
    title: "8. Contacto",
    icon: <MessageSquare className="h-5 w-5" />,
    content: (
      <p>
        Si tienes preguntas o inquietudes sobre esta Política de Privacidad o nuestras prácticas de datos, contáctanos a
        través de nuestra{" "}
        <a href="/contact" className="text-primary hover:underline">
          página de contacto
        </a>
        .
      </p>
    ),
  },
]

export default function PrivacyPolicyPage() {
  const [viewMode, setViewMode] = useState<"full" | "accordion" | "tabs">("full")

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
                <Shield className="h-10 w-10 text-primary" />
              </div>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-4 tracking-tight">
            Política de Privacidad
          </h1>

          <div className="relative inline-block mt-2 mb-6">
            <Sparkles className="absolute -top-4 -left-6 h-6 w-6 text-primary animate-pulse" />
            <p className="text-xl md:text-2xl text-muted-foreground">Protección y manejo de tus datos</p>
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
                <Lock className="h-6 w-6 text-primary" />
                Política de Privacidad de Techno Espacio
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
                  <TabsList className="grid grid-cols-4 md:grid-cols-8 mb-6">
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
                Esta política está redactada en cumplimiento con las regulaciones de protección de datos aplicables.
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

