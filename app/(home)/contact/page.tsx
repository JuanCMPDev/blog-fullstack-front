"use client"

import { motion } from "framer-motion"
import { ContactForm } from "@/components/forms/ContactForm"
import { DownloadCV } from "@/components/common/DownloadCV"
import { SocialLinks } from "@/components/common/SocialLinks"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-dot-pattern flex flex-col justify-center items-center overflow-hidden">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-4">Conectemos</h1>
          <div className="relative inline-block mt-2">
            <Sparkles className="absolute -top-4 -left-6 h-6 w-6 text-primary animate-pulse" />
            <p className="text-xl md:text-2xl text-muted-foreground">Estamos a un mensaje de distancia</p>
            <Sparkles className="absolute -bottom-4 -right-6 h-6 w-6 text-primary animate-pulse" />
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <motion.div className="md:col-span-2" variants={fadeInUp} initial="initial" animate="animate">
            <div className="h-full">
              <ContactForm />
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.2 }}>
            <div className="grid gap-8 h-full">
              <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">Mi Experiencia</h2>
                  <DownloadCV />
                </CardContent>
              </Card>

              <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">Conéctate</h2>
                  <SocialLinks />
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

