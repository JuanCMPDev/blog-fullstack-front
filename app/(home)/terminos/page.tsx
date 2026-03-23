"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Scale,
  ArrowLeft,
  FileText,
  HelpCircle,
  User,
  Copyright,
  MessageSquare,
  LinkIcon,
  ShieldAlert,
  Gavel,
  RefreshCw,
  XCircle,
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
    id: "aceptacion",
    title: "1. Aceptación de los Términos",
    shortTitle: "Aceptación",
    icon: <FileText className="h-4 w-4" />,
    content: (
      <p>
        Al acceder o utilizar Techno Espacio, aceptas cumplir y estar sujeto a estos Términos de Uso. Si no estás
        de acuerdo con alguna parte de estos términos, no podrás acceder al servicio.
      </p>
    ),
  },
  {
    id: "descripcion",
    title: "2. Descripción del Servicio",
    shortTitle: "Servicio",
    icon: <HelpCircle className="h-4 w-4" />,
    content: (
      <p>
        Techno Espacio es una plataforma educativa que proporciona contenido relacionado con tecnología,
        programación, desarrollo web y otros temas del ámbito digital. Nuestros servicios pueden incluir, entre
        otros, artículos, tutoriales, cursos y recursos educativos.
      </p>
    ),
  },
  {
    id: "cuentas",
    title: "3. Cuentas de Usuario",
    shortTitle: "Cuentas",
    icon: <User className="h-4 w-4" />,
    content: (
      <>
        <p className="mb-4">
          Algunas funciones de nuestro servicio requieren el registro de una cuenta. Al registrarte, aceptas
          proporcionar información precisa, completa y actualizada. Eres responsable de mantener la
          confidencialidad de tu contraseña y de todas las actividades que ocurran bajo tu cuenta.
        </p>
        <p>
          Nos reservamos el derecho de suspender o terminar tu cuenta si consideramos que has violado estos
          términos o si tu comportamiento es perjudicial para nuestra plataforma o para otros usuarios.
        </p>
      </>
    ),
  },
  {
    id: "propiedad",
    title: "4. Propiedad Intelectual",
    shortTitle: "Propiedad Intelectual",
    icon: <Copyright className="h-4 w-4" />,
    content: (
      <>
        <p className="mb-4">
          Todo el contenido presente en Techno Espacio, incluyendo textos, gráficos, logos, iconos, imágenes,
          clips de audio, descargas digitales y software, es propiedad de Techno Espacio o de nuestros proveedores
          de contenido y está protegido por leyes de propiedad intelectual.
        </p>
        <p>
          El uso no autorizado de nuestro contenido puede constituir una violación de las leyes de derechos de
          autor, marcas registradas, y otras leyes de propiedad intelectual.
        </p>
      </>
    ),
  },
  {
    id: "contenido-usuario",
    title: "5. Contenido del Usuario",
    shortTitle: "Tu contenido",
    icon: <MessageSquare className="h-4 w-4" />,
    content: (
      <>
        <p className="mb-4">
          Nuestro servicio puede permitirte publicar, enlazar, almacenar, compartir y de otra manera poner a
          disposición cierto contenido, incluyendo mensajes, comentarios, imágenes y otros materiales.
        </p>
        <p className="mb-4">
          Al proporcionar contenido a través de nuestro servicio, otorgas a Techno Espacio una licencia mundial,
          no exclusiva, libre de regalías, transferible y sublicenciable para usar, reproducir, modificar, adaptar,
          publicar, traducir, distribuir y mostrar dicho contenido.
        </p>
        <p>
          Eres el único responsable del contenido que publicas y de las consecuencias de compartirlo. No publicarás
          contenido que sea ilegal, fraudulento, engañoso, difamatorio, obsceno, pornográfico, o que infrinja
          derechos de terceros.
        </p>
      </>
    ),
  },
  {
    id: "enlaces",
    title: "6. Enlaces a Otros Sitios Web",
    shortTitle: "Enlaces externos",
    icon: <LinkIcon className="h-4 w-4" />,
    content: (
      <>
        <p className="mb-4">
          Nuestro servicio puede contener enlaces a sitios web de terceros que no son propiedad ni están
          controlados por Techno Espacio. No tenemos control sobre, y no asumimos responsabilidad por, el
          contenido, políticas de privacidad, o prácticas de sitios web de terceros.
        </p>
        <p>
          Reconoces y aceptas que Techno Espacio no será responsable, directa o indirectamente, por cualquier daño
          o pérdida causados o supuestamente causados por o en conexión con el uso o la confianza en cualquier
          contenido, bienes o servicios disponibles en o a través de tales sitios web.
        </p>
      </>
    ),
  },
  {
    id: "responsabilidad",
    title: "7. Limitación de Responsabilidad",
    shortTitle: "Responsabilidad",
    icon: <ShieldAlert className="h-4 w-4" />,
    content: (
      <p>
        En ningún caso Techno Espacio, sus directores, empleados, socios, agentes, proveedores o afiliados serán
        responsables por cualquier daño indirecto, incidental, especial, consecuente o punitivo, incluyendo sin
        limitación, pérdida de beneficios, datos, uso, buena voluntad, u otras pérdidas intangibles.
      </p>
    ),
  },
  {
    id: "indemnizacion",
    title: "8. Indemnización",
    shortTitle: "Indemnización",
    icon: <Gavel className="h-4 w-4" />,
    content: (
      <p>
        Aceptas defender, indemnizar y mantener indemne a Techno Espacio y a sus licenciantes, empleados,
        contratistas, agentes, funcionarios y directores, de y contra cualquier reclamo, daños, obligaciones,
        pérdidas, responsabilidades, costos o deudas, y gastos (incluyendo pero no limitado a honorarios de
        abogados) que surjan de: (i) tu uso y acceso al Servicio; (ii) tu violación de estos Términos; (iii) tu
        violación de cualquier derecho de terceros, incluidos sin limitación cualquier derecho de autor, propiedad
        o privacidad.
      </p>
    ),
  },
  {
    id: "cambios",
    title: "9. Cambios en los Términos",
    shortTitle: "Cambios",
    icon: <RefreshCw className="h-4 w-4" />,
    content: (
      <>
        <p className="mb-4">
          Nos reservamos el derecho, a nuestra sola discreción, de modificar o reemplazar estos Términos en
          cualquier momento. Si una revisión es material, intentaremos proporcionar al menos 30 días de aviso antes
          de que los nuevos términos entren en vigencia.
        </p>
        <p>
          Al continuar accediendo o utilizando nuestro Servicio después de que las revisiones entren en vigencia,
          aceptas estar sujeto a los términos revisados.
        </p>
      </>
    ),
  },
  {
    id: "terminacion",
    title: "10. Terminación",
    shortTitle: "Terminación",
    icon: <XCircle className="h-4 w-4" />,
    content: (
      <p>
        Podemos terminar o suspender tu acceso inmediatamente, sin previo aviso o responsabilidad, por cualquier
        razón, incluyendo sin limitación si incumples los Términos. Tras la terminación, tu derecho a utilizar el
        Servicio cesará inmediatamente.
      </p>
    ),
  },
  {
    id: "ley",
    title: "11. Ley Aplicable",
    shortTitle: "Ley aplicable",
    icon: <Gavel className="h-4 w-4" />,
    content: (
      <p>
        Estos Términos se regirán e interpretarán de acuerdo con las leyes colombianas, sin dar efecto a ningún
        principio de conflictos de leyes.
      </p>
    ),
  },
  {
    id: "contacto",
    title: "12. Contacto",
    shortTitle: "Contacto",
    icon: <MessageSquare className="h-4 w-4" />,
    content: (
      <p>
        Si tienes alguna pregunta sobre estos Términos, por favor contáctanos a través de nuestra{" "}
        <Link href="/contact" className="text-primary hover:underline font-medium">
          página de contacto
        </Link>
        .
      </p>
    ),
  },
]

export default function TermsOfServicePage() {
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
                <Scale className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Términos de Uso
                </h1>
                <p className="text-muted-foreground mt-1">
                  Condiciones para el uso de nuestra plataforma
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
          {/* TOC Sidebar */}
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
                <Link href="/politica-privacidad">Política de Privacidad</Link>
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
