'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Code, 
  Award, 
  BookOpen, 
  Leaf, 
  Target, 
  LucideIcon, 
  Sparkles 
} from 'lucide-react';
import Image from 'next/image';

// Definición de interfaces para nuestros datos
interface TeamMember {
  name: string;
  role: string;
  bio: string;
  avatar: string;
}

interface ValueItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

export default function AboutPage() {
  const [isClient, setIsClient] = useState(false);

  // Aseguramos que las animaciones solo ocurran en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Datos simulados para el equipo
  const teamMembers: TeamMember[] = [
    {
      name: 'Juan Carlos Muñoz',
      role: 'Fundador & Desarrollador',
      bio: 'Apasionado por la tecnología y la educación. Con experiencia en desarrollo web y móvil, y un fuerte compromiso con compartir conocimientos.',
      avatar: '/team/profile1.jpg',
    },
    {
      name: 'Ana Martínez',
      role: 'Diseñadora UX/UI',
      bio: 'Especialista en crear experiencias digitales centradas en el usuario. Combina creatividad y funcionalidad para diseñar interfaces intuitivas.',
      avatar: '/team/profile2.jpg',
    },
    {
      name: 'Carlos Rodríguez',
      role: 'Ingeniero de Software',
      bio: 'Desarrollador full-stack con amplia experiencia en arquitecturas escalables. Apasionado por las buenas prácticas y el código limpio.',
      avatar: '/team/profile3.jpg',
    },
  ];

  // Valores de la empresa
  const values: ValueItem[] = [
    {
      title: 'Innovación',
      description: 'Buscamos constantemente nuevas formas de resolver problemas y mejorar nuestras soluciones.',
      icon: Sparkles,
    },
    {
      title: 'Calidad',
      description: 'Nos comprometemos a entregar productos y contenidos de la más alta calidad.',
      icon: Award,
    },
    {
      title: 'Aprendizaje Continuo',
      description: 'Creemos que el aprendizaje es un proceso continuo y fomentamos el crecimiento constante.',
      icon: BookOpen,
    },
    {
      title: 'Sostenibilidad',
      description: 'Desarrollamos soluciones que son sostenibles a largo plazo, tanto tecnológica como ambientalmente.',
      icon: Leaf,
    },
    {
      title: 'Comunidad',
      description: 'Valoramos la contribución de la comunidad y trabajamos para fortalecerla.',
      icon: Users,
    },
    {
      title: 'Objetivos Claros',
      description: 'Establecemos metas específicas y trabajamos con determinación para alcanzarlas.',
      icon: Target,
    },
  ];

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  // Estado de carga para SSR
  if (!isClient) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="bg-dot-pattern min-h-[calc(100vh-8rem)]">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-4">Sobre Nosotros</h1>
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="h-1 w-12 bg-primary rounded"></div>
              <span className="text-sm font-medium text-muted-foreground">
                Conoce nuestro equipo y misión
              </span>
              <div className="h-1 w-12 bg-primary rounded"></div>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Somos un equipo apasionado por compartir conocimientos y experiencias en el mundo de la tecnología 
              y el desarrollo de software.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
          >
            <motion.div variants={itemVariants} className="order-2 md:order-1">
              <h2 className="text-2xl font-bold mb-4">Nuestra Historia</h2>
              <p className="mb-4 text-muted-foreground">
                JCDevBlog nació en 2023 como una plataforma para compartir conocimientos y experiencias en 
                el mundo del desarrollo web. Lo que comenzó como un proyecto personal ha evolucionado en una 
                comunidad vibrante de desarrolladores y entusiastas de la tecnología.
              </p>
              <p className="mb-4 text-muted-foreground">
                Nuestra misión es democratizar el conocimiento técnico, haciendo que los conceptos complejos 
                sean accesibles para todos, independientemente de su nivel de experiencia.
              </p>
              <div className="flex items-center space-x-6 mt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">5000+</p>
                  <p className="text-sm text-muted-foreground">Usuarios</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">100+</p>
                  <p className="text-sm text-muted-foreground">Artículos</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">24+</p>
                  <p className="text-sm text-muted-foreground">Proyectos</p>
                </div>
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="order-1 md:order-2 flex justify-center">
              <div className="relative w-full max-w-md h-[350px] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/about-image.jpg"
                  alt="Nuestro equipo"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent">
                  <div className="absolute bottom-4 left-4 bg-primary text-primary-foreground p-3 rounded-lg shadow-lg">
                    <Code className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="valores" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList>
                <TabsTrigger value="valores">Nuestros Valores</TabsTrigger>
                <TabsTrigger value="equipo">Nuestro Equipo</TabsTrigger>
              </TabsList>
            </div>
            
            {/* Valores Tab */}
            <TabsContent value="valores">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {values.map((value, index) => (
                  <motion.div key={index} variants={itemVariants}>
                    <Card className="h-full hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <value.icon className="h-5 w-5 text-primary" />
                          </div>
                          <CardTitle className="text-xl">{value.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{value.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>
            
            {/* Equipo Tab */}
            <TabsContent value="equipo">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {teamMembers.map((member, index) => (
                  <motion.div key={index} variants={itemVariants}>
                    <Card className="h-full hover:shadow-md transition-shadow overflow-hidden">
                      <div className="relative h-48 w-full">
                        <Image
                          src={member.avatar}
                          alt={member.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardHeader>
                        <CardTitle>{member.name}</CardTitle>
                        <p className="text-sm text-primary font-medium">{member.role}</p>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{member.bio}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-4">¿Listo para unirte a nuestra comunidad?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Explora nuestros artículos, comparte tus conocimientos y forma parte de una comunidad en crecimiento.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium"
              >
                Explorar Artículos
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md font-medium"
              >
                Contactar
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 