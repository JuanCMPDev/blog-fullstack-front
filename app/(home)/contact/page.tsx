"use client"

import { motion } from "framer-motion"
import { ContactForm } from "@/components/forms/ContactForm"
import { DownloadCV } from "@/components/common/DownloadCV"
import { SocialLinks } from "@/components/common/SocialLinks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Mail, MapPin, Phone, Sparkles } from "lucide-react"

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] },
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
    <div className="min-h-screen bg-dot-pattern flex flex-col justify-center items-center overflow-hidden">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-4 tracking-tight">Conectemos</h1>
          <div className="relative inline-block mt-2">
            <Sparkles className="absolute -top-4 -left-6 h-6 w-6 text-primary animate-pulse" />
            <p className="text-xl md:text-2xl text-muted-foreground">Estamos a un mensaje de distancia</p>
            <Sparkles className="absolute -bottom-4 -right-6 h-6 w-6 text-primary animate-pulse" />
          </div>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-12 gap-8 max-w-6xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Contact Form Section */}
          <motion.div className="md:col-span-7" variants={fadeInUp}>
            <Card className="h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Envíame un mensaje</CardTitle>
                <CardDescription>Completa el formulario y me pondré en contacto contigo pronto</CardDescription>
              </CardHeader>
              <CardContent>
                <ContactForm />
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Side Content */}
          <motion.div className="md:col-span-5" variants={fadeInUp}>
            <div className="grid gap-8 h-full">
              {/* Contact Information Card */}
              <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Información de contacto</CardTitle>
                  <CardDescription>Otras formas de contactarme</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">juancarlosmpdev@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Teléfono / WhatsApp</p>
                      <p className="font-medium">+58 3182520552</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ubicación</p>
                      <p className="font-medium">Bogotá, Colombia</p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Conéctate</h3>
                    <SocialLinks />
                  </div>
                </CardContent>
              </Card>

              {/* CV Download Card */}
              <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Mi Experiencia</CardTitle>
                  <CardDescription>Descarga mi CV para conocer mi trayectoria profesional</CardDescription>
                </CardHeader>
                <CardContent>
                  <DownloadCV />
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

