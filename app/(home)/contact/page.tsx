"use client"

import { motion } from "framer-motion"
import { ContactForm } from "@/components/forms/ContactForm"
import { DownloadCV } from "@/components/common/DownloadCV"
import { SocialLinks } from "@/components/common/SocialLinks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Mail, MapPin, Clock, MessageSquare } from "lucide-react"

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function ContactPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-dot-pattern">
      {/* Background orbs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-24 right-[-8rem] h-[30rem] w-[30rem] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute top-[35%] left-[-10rem] h-[26rem] w-[26rem] rounded-full bg-secondary/40 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[20%] h-[18rem] w-[18rem] rounded-full bg-primary/10 blur-2xl" />
      </div>

      {/* Hero section */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-primary">Contacto</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-extrabold tracking-tight mb-4">
              <span className="text-primary">Conectemos</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
              ¿Tienes una idea, propuesta o consulta? Estoy a un mensaje de distancia.
              Completa el formulario y te responderé lo antes posible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="relative z-10 container mx-auto px-4 pb-16 md:pb-24">
        <motion.div
          className="grid md:grid-cols-12 gap-6 max-w-6xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Contact Form */}
          <motion.div className="md:col-span-7" variants={fadeInUp}>
            <Card className="glass-card border-border/30 relative overflow-hidden">
              <CardHeader>
                <CardTitle className="text-2xl font-headline font-bold">Envíame un mensaje</CardTitle>
                <CardDescription>Completa el formulario y te responderé lo antes posible</CardDescription>
              </CardHeader>
              <CardContent>
                <ContactForm />
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div className="md:col-span-5" variants={fadeInUp}>
            <div className="grid gap-6 h-full">
              {/* Contact Info */}
              <Card className="glass-card border-border/30">
                <CardHeader>
                  <CardTitle className="text-xl font-headline font-bold">Información de contacto</CardTitle>
                  <CardDescription>Otras formas de contactarme</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2.5 rounded-lg">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <a
                        href="mailto:juancarlosmpdev@gmail.com"
                        className="text-sm font-medium hover:text-primary transition-colors"
                      >
                        juancarlosmpdev@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2.5 rounded-lg">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ubicación</p>
                      <p className="text-sm font-medium">Bogotá, Colombia</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2.5 rounded-lg">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tiempo de respuesta</p>
                      <p className="text-sm font-medium">Generalmente en 24-48 horas</p>
                    </div>
                  </div>

                  <Separator className="my-2 bg-border/30" />

                  <div>
                    <h3 className="text-sm font-headline font-semibold mb-3">Redes Sociales</h3>
                    <SocialLinks />
                  </div>
                </CardContent>
              </Card>

              {/* CV Download */}
              <Card className="glass-card border-border/30">
                <CardHeader>
                  <CardTitle className="text-xl font-headline font-bold">Mi Experiencia</CardTitle>
                  <CardDescription>Descarga mi CV para conocer mi trayectoria</CardDescription>
                </CardHeader>
                <CardContent>
                  <DownloadCV />
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}
