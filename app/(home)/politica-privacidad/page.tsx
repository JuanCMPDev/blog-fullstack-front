"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Shield,
  ArrowLeft,
  Info,
  Database,
  FileText,
  Share2,
  UserCheck,
  ShieldCheck,
  RefreshCw,
  MessageSquare,
  ArrowUp,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Section {
  id: string
  title: string
  shortTitle: string
  icon: React.ReactNode
  content: React.ReactNode
}

const sections: Section[] = [
  {
    id: "introduccion",
    title: "1. Introducción",
    shortTitle: "Introducción",
    icon: <Info className="h-4 w-4" />,
    content: (
      <>
        <p className="mb-4">
          En Techno Espacio, nos comprometemos a proteger la privacidad de nuestros usuarios. Esta Política de
          Privacidad describe cómo recopilamos, usamos, procesamos y compartimos tu información personal cuando
          utilizas nuestro sitio web y servicios.
        </p>
        <p>
          Al utilizar Techno Espacio, aceptas las prácticas descritas en esta Política de Privacidad. Te recomendamos
          leer este documento detenidamente para comprender nuestras políticas y prácticas con respecto a tu
          información personal.
        </p>
      </>
    ),
  },
  {
    id: "recopilacion",
    title: "2. Información que recopilamos",
    shortTitle: "Recopilación",
    icon: <Database className="h-4 w-4" />,
    content: (
      <>
        <p className="mb-4">Podemos recopilar los siguientes tipos de información:</p>
        <ul className="space-y-3">
          <li className="flex gap-3">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
            <span>
              <strong className="text-foreground">Información personal identificable:</strong> Nombre, dirección de
              correo electrónico, nombre de usuario y fotografía de perfil cuando te registras en nuestra plataforma.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
            <span>
              <strong className="text-foreground">Información de uso:</strong> Datos sobre cómo interactúas con
              nuestro sitio, incluyendo las páginas que visitas, el tiempo que pasas en ellas y las funciones que
              utilizas.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
            <span>
              <strong className="text-foreground">Información técnica:</strong> Dirección IP, tipo de navegador,
              proveedor de servicios de Internet, identificadores de dispositivos y sistema operativo.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
            <span>
              <strong className="text-foreground">Cookies y tecnologías similares:</strong> Utilizamos cookies y
              tecnologías similares para recopilar información sobre tu actividad, navegador y dispositivo.
            </span>
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "uso",
    title: "3. Cómo utilizamos tu información",
    shortTitle: "Uso de datos",
    icon: <FileText className="h-4 w-4" />,
    content: (
      <>
        <p className="mb-4">Utilizamos la información que recopilamos para:</p>
        <ul className="space-y-2">
          {[
            "Proporcionar, mantener y mejorar nuestros servicios",
            "Procesar y completar transacciones",
            "Enviar información técnica, actualizaciones, alertas de seguridad y mensajes de soporte",
            "Responder a tus comentarios, preguntas y solicitudes",
            "Desarrollar nuevos productos y servicios",
            "Personalizar tu experiencia",
            "Proteger contra actividades fraudulentas y abusos",
            "Cumplir con obligaciones legales",
          ].map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "compartir",
    title: "4. Compartir tu información",
    shortTitle: "Compartir datos",
    icon: <Share2 className="h-4 w-4" />,
    content: (
      <>
        <p className="mb-4">
          No vendemos tu información personal a terceros. Sin embargo, podemos compartir tu información en las
          siguientes circunstancias:
        </p>
        <ul className="space-y-2">
          {[
            "Con proveedores de servicios que nos ayudan a operar nuestro sitio",
            "Con tu consentimiento o según tus instrucciones",
            "Para cumplir con leyes, regulaciones o procesos legales",
            "En relación con una fusión, venta de activos o transacción financiera",
            "Para proteger los derechos, propiedad o seguridad de Techno Espacio y nuestros usuarios",
          ].map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "derechos",
    title: "5. Tus derechos y opciones",
    shortTitle: "Tus derechos",
    icon: <UserCheck className="h-4 w-4" />,
    content: (
      <>
        <p className="mb-4">
          Dependiendo de tu ubicación, puedes tener ciertos derechos con respecto a tu información personal,
          incluyendo:
        </p>
        <ul className="space-y-2">
          {[
            "Acceder a tu información personal",
            "Corregir datos inexactos",
            "Eliminar tu información",
            "Oponerte al procesamiento de tus datos",
            "Exportar tus datos en un formato portátil",
            "Retirar tu consentimiento en cualquier momento",
          ].map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4">
          Para ejercer estos derechos, contáctanos a través de nuestra{" "}
          <Link href="/contact" className="text-primary hover:underline font-medium">
            página de contacto
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    id: "seguridad",
    title: "6. Seguridad de la información",
    shortTitle: "Seguridad",
    icon: <ShieldCheck className="h-4 w-4" />,
    content: (
      <p>
        Implementamos medidas de seguridad diseñadas para proteger tu información personal contra acceso no
        autorizado, uso o divulgación. Sin embargo, ningún sistema es completamente seguro, y no podemos garantizar
        la seguridad absoluta de tu información.
      </p>
    ),
  },
  {
    id: "cambios",
    title: "7. Cambios a esta política",
    shortTitle: "Cambios",
    icon: <RefreshCw className="h-4 w-4" />,
    content: (
      <p>
        Podemos actualizar esta Política de Privacidad periódicamente. Te notificaremos sobre cambios significativos
        mediante un aviso visible en nuestro sitio o por correo electrónico. Te recomendamos revisar esta política
        regularmente.
      </p>
    ),
  },
  {
    id: "contacto",
    title: "8. Contacto",
    shortTitle: "Contacto",
    icon: <MessageSquare className="h-4 w-4" />,
    content: (
      <p>
        Si tienes preguntas o inquietudes sobre esta Política de Privacidad o nuestras prácticas de datos,
        contáctanos a través de nuestra{" "}
        <Link href="/contact" className="text-primary hover:underline font-medium">
          página de contacto
        </Link>
        .
      </p>
    ),
  },
]

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState(sections[0].id)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px" }
    )

    for (const section of sections) {
      const el = sectionRefs.current[section.id]
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

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
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Política de Privacidad
                </h1>
                <p className="text-muted-foreground mt-1">
                  Cómo protegemos y manejamos tus datos personales
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground/70 mt-4">
              Última actualización: 1 de enero de 2025
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content with TOC sidebar */}
      <div className="container mx-auto px-4 py-10">
        <div className="flex gap-10 max-w-5xl mx-auto">
          {/* TOC Sidebar - sticky on desktop */}
          <aside className="hidden lg:block w-56 shrink-0">
            <nav className="sticky top-24 space-y-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-3 px-2">
                Contenido
              </p>
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    "flex items-center gap-2 w-full text-left px-2.5 py-1.5 rounded-md text-sm transition-colors",
                    activeSection === section.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {section.icon}
                  <span className="truncate">{section.shortTitle}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 max-w-3xl">
            <div className="space-y-0">
              {sections.map((section, index) => (
                <motion.section
                  key={section.id}
                  id={section.id}
                  ref={(el) => { sectionRefs.current[section.id] = el }}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: index * 0.03 }}
                  className={cn(
                    "scroll-mt-24 py-8",
                    index < sections.length - 1 && "border-b border-border/30"
                  )}
                >
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2.5 text-foreground">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary shrink-0">
                      {section.icon}
                    </span>
                    {section.title}
                  </h2>
                  <div className="text-[15px] text-muted-foreground leading-relaxed pl-[38px]">
                    {section.content}
                  </div>
                </motion.section>
              ))}
            </div>

            {/* Related links */}
            <div className="mt-12 flex flex-col sm:flex-row gap-3">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href="/terminos">Términos de Uso</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href="/faq">Preguntas Frecuentes</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href="/contact">Contacto</Link>
              </Button>
            </div>
          </main>
        </div>
      </div>

      {/* Scroll to top */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
        >
          <ArrowUp className="h-4 w-4" />
        </motion.button>
      )}
    </div>
  )
}
