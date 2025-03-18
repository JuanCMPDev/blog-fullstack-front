"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sparkles,
  User,
  BookOpen,
  Code,
  Lightbulb,
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  Target,
  Heart,
  Rocket,
} from "lucide-react"
import Link from "next/link"

// Componente personalizado para el ícono de X (anteriormente Twitter)
const XIcon = ({ className = "", size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    strokeWidth="0"
    className={className}
  >
    <path 
      d="M16.99 0H20.298L13.071 8.26L21.573 19.5H14.916L9.702 12.683L3.736 19.5H0.426L8.156 10.665L0 0H6.826L11.539 6.231L16.99 0ZM15.829 17.52H17.662L5.83 1.876H3.863L15.829 17.52Z" 
      fill="currentColor"
    />
  </svg>
)

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

// Datos del autor
const author = {
  name: "Juan Carlos Muñoz",
  role: "Desarrollador de Software",
  bio: "Desarrollador de software apasionado por la tecnología y el desarrollo web. Creé Techno Espacio para compartir mis conocimientos y experiencias en el mundo digital, con la esperanza de ayudar a otros en su camino de aprendizaje.",
  avatar: "/profile.jpg",
  skills: ["NextJS", "NestJS", "SQL", "NoSQL"],
  social: {
    twitter: "https://x.com/juancm_dev",
    github: "https://github.com/JuanCMPDev",
    linkedin: "https://www.linkedin.com/in/juan-carlos-mu%C3%B1oz/",
  },
}

// Objetivos futuros
const futureGoals = [
  {
    title: "Lanzamiento",
    description: "Crear los primeros artículos fundamentales y establecer la identidad visual del blog.",
    status: "Completado",
    icon: <Rocket className="h-4 w-4" />,
  },
  {
    title: "Crecimiento inicial",
    description: "Publicar contenido regularmente y comenzar a construir una pequeña comunidad de lectores.",
    status: "En progreso",
    icon: <Target className="h-4 w-4" />,
  },
  {
    title: "Expansión de contenido",
    description: "Diversificar los temas tratados e invitar a colaboradores ocasionales para enriquecer el blog.",
    status: "Próximamente",
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    title: "Comunidad interactiva",
    description: "Implementar foros de discusión y crear un espacio para que los lectores compartan sus experiencias.",
    status: "Futuro",
    icon: <User className="h-4 w-4" />,
  },
]

// Valores del blog
const values = [
  {
    icon: <BookOpen className="h-8 w-8" />,
    title: "Conocimiento Accesible",
    description:
      "Creo que el conocimiento tecnológico debe ser claro y accesible para todos, independientemente de su nivel de experiencia.",
  },
  {
    icon: <Code className="h-8 w-8" />,
    title: "Calidad Técnica",
    description:
      "Me comprometo a ofrecer contenido técnicamente preciso y actualizado, basado en experiencias reales y mejores prácticas.",
  },
  {
    icon: <Lightbulb className="h-8 w-8" />,
    title: "Innovación Constante",
    description:
      "Busco mantenerme al día con las nuevas tecnologías para proporcionar contenido relevante y útil para mis lectores.",
  },
  {
    icon: <Heart className="h-8 w-8" />,
    title: "Pasión por la Tecnología",
    description: "Comparto mi entusiasmo por la tecnología y busco inspirar a otros a explorar y crear con ella.",
  },
]

// Temas del blog
const blogTopics = [
  "Inteligencia Artificial",
  "Tecnologías Emergentes",
  "Dispositivos Inteligentes",
  "Ciberseguridad",
  "Transformación Digital",
  "Desarrollo Web",
  "Tecnologías Cloud",
  "Programación",
  "Tendencias Tecnológicas",
  "Gadgets",
  "Apps y Software"
]

export default function AboutPage() {
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
                <User className="h-10 w-10 text-primary" />
              </div>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-4 tracking-tight">Sobre Mí</h1>

          <div className="relative inline-block mt-2 mb-6">
            <Sparkles className="absolute -top-4 -left-6 h-6 w-6 text-primary animate-pulse" />
            <p className="text-xl md:text-2xl text-muted-foreground">Conoce al creador de Techno Espacio</p>
            <Sparkles className="absolute -bottom-4 -right-6 h-6 w-6 text-primary animate-pulse" />
          </div>
        </motion.div>

        <Tabs defaultValue="about" className="max-w-4xl mx-auto mb-8">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="about" className="text-sm md:text-base">
              Sobre Mí
            </TabsTrigger>
            <TabsTrigger value="vision" className="text-sm md:text-base">
              Visión
            </TabsTrigger>
            <TabsTrigger value="values" className="text-sm md:text-base">
              Valores
            </TabsTrigger>
          </TabsList>

          <TabsContent value="about">
            <motion.div className="max-w-4xl mx-auto" variants={staggerContainer} initial="initial" animate="animate">
              <Card className="shadow-lg border border-border/40 backdrop-blur-sm bg-card/95 overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/40 pb-8">
                  <CardTitle className="text-2xl md:text-3xl font-bold text-center">
                    ¡Hola, soy {author.name}!
                  </CardTitle>
                </CardHeader>

                <CardContent className="pt-8 px-4 md:px-8">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <motion.div
                      variants={fadeInUp}
                      className="flex flex-col items-center text-center md:items-start md:text-left"
                    >
                      <Avatar className="h-32 w-32 mb-6 border-4 border-background shadow-xl">
                        <AvatarImage src={author.avatar} alt={author.name} />
                        <AvatarFallback>
                          {author.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <h3 className="text-xl font-bold mb-1">{author.name}</h3>
                      <p className="text-primary text-sm mb-4">{author.role}</p>

                      <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                        {author.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex justify-center md:justify-start gap-3 mb-6">
                        <a
                          href={author.social.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                          aria-label="X"
                        >
                          <XIcon className="h-5 w-5" />
                        </a>
                        <a
                          href={author.social.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Github className="h-5 w-5" />
                        </a>
                        <a
                          href={author.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Linkedin className="h-5 w-5" />
                        </a>
                      </div>

                      <Badge variant="outline" className="text-sm px-3 py-1 bg-primary/10">
                        <Rocket className="h-4 w-4 mr-1" />
                        <span>Blog iniciado en {new Date().getFullYear()}</span>
                      </Badge>
                    </motion.div>

                    <motion.div variants={fadeInUp} className="space-y-6">
                      <p className="text-base md:text-lg text-muted-foreground leading-relaxed">{author.bio}</p>

                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Temas del blog</h4>
                        <div className="flex flex-wrap gap-2">
                          {blogTopics.map((topic) => (
                            <Badge key={topic} variant="outline" className="bg-muted/30">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4">
                        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                          Este blog es mi espacio para compartir lo que aprendo día a día, documentar mis proyectos y
                          ayudar a otros desarrolladores a superar los desafíos que yo mismo he enfrentado.
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="vision">
            <motion.div className="max-w-4xl mx-auto" variants={staggerContainer} initial="initial" animate="animate">
              <Card className="shadow-lg border border-border/40 backdrop-blur-sm bg-card/95 overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/40 pb-8">
                  <CardTitle className="text-2xl md:text-3xl font-bold text-center">
                    Mi Visión para Techno Espacio
                  </CardTitle>
                </CardHeader>

                <CardContent className="pt-8 px-4 md:px-8">
                  <motion.div variants={fadeInUp} className="mb-8">
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6">
                      Techno Espacio nace con la visión de convertirse en un recurso valioso para desarrolladores de
                      todos los niveles. Aunque el blog está en sus primeras etapas, tengo grandes planes para su
                      crecimiento y evolución.
                    </p>

                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                      Mi objetivo es crear un espacio donde la tecnología sea accesible, donde los conceptos complejos
                      se expliquen de manera clara y donde los lectores encuentren soluciones prácticas a problemas
                      reales.
                    </p>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-semibold mb-6">Hoja de Ruta</h3>

                    {/* Timeline - Improved version */}
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-0 md:left-[7.5rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/30 to-primary/10 ml-6 md:ml-0"></div>

                      <div className="space-y-12 relative">
                        {futureGoals.map((goal) => (
                          <div
                            key={goal.title}
                            className="relative flex flex-col md:flex-row md:items-center gap-4 md:gap-6"
                          >
                            {/* Timeline dot */}
                            <div className="absolute left-0 ml-6 md:ml-0 md:relative md:left-auto w-3 h-3 rounded-full bg-primary ring-4 ring-primary/20 z-10"></div>

                            {/* Date/Status for larger screens */}
                            <div className="hidden md:flex md:flex-col md:items-end md:w-28 md:mr-8 md:text-right">
                              <Badge
                                variant={
                                  goal.status === "Completado"
                                    ? "default"
                                    : goal.status === "En progreso"
                                      ? "secondary"
                                      : "outline"
                                }
                                className="mb-1"
                              >
                                {goal.status}
                              </Badge>
                            </div>

                            {/* Content card */}
                            <div className="ml-12 md:ml-0 flex-1">
                              <div className="bg-muted/20 rounded-lg p-5 border border-border/40 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                      {goal.icon}
                                    </div>
                                    <h3 className="text-lg font-bold">{goal.title}</h3>
                                  </div>

                                  {/* Status badge for mobile */}
                                  <div className="md:hidden">
                                    <Badge
                                      variant={
                                        goal.status === "Completado"
                                          ? "default"
                                          : goal.status === "En progreso"
                                            ? "secondary"
                                            : "outline"
                                      }
                                      className="text-xs"
                                    >
                                      {goal.status}
                                    </Badge>
                                  </div>
                                </div>
                                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                                  {goal.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="values">
            <motion.div className="max-w-4xl mx-auto" variants={staggerContainer} initial="initial" animate="animate">
              <Card className="shadow-lg border border-border/40 backdrop-blur-sm bg-card/95 overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/40 pb-8">
                  <CardTitle className="text-2xl md:text-3xl font-bold text-center">Mis Valores</CardTitle>
                </CardHeader>

                <CardContent className="pt-8 px-4 md:px-8">
                  <motion.div variants={fadeInUp} className="mb-8">
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed text-center">
                      Estos son los principios que guían mi trabajo y el contenido que comparto en Techno Espacio.
                    </p>
                  </motion.div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    {values.map((value) => (
                      <motion.div
                        key={value.title}
                        variants={fadeInUp}
                        className="flex flex-col sm:flex-row gap-4 p-5 rounded-lg border border-border/40 bg-muted/10 hover:bg-muted/20 transition-colors"
                      >
                        <div className="shrink-0 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto sm:mx-0">
                          {value.icon}
                        </div>
                        <div className="text-center sm:text-left">
                          <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        <motion.div
          className="max-w-4xl mx-auto mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6">¿Te gustaría conectar conmigo?</h2>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2">
              <Mail className="h-5 w-5" />
              Contáctame
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
                <ExternalLink className="h-5 w-5" />
                  <Link href="/">
                    Visitar el Blog
                  </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

