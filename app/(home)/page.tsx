"use client"

import { useState, useEffect } from "react"
import { BlogList } from "@/components/BlogList"
import { Pagination } from "@/components/Pagination"
import { Hero } from "@/components/Hero"
import { Sidebar } from "@/components/Sidebar"

const mockPosts = [
  {
    id: 1,
    title: "Introducción a la Programación",
    excerpt:
      "Un vistazo a los fundamentos de la programación y cómo empezar tu viaje en el mundo del desarrollo de software.",
    votes: 10,
    comments: 5,
    image: "/placeholder-post-image.jpeg",
    tags: ["Programación", "Principiantes"],
  },
  {
    id: 2,
    title: "Estructuras de Datos Avanzadas",
    excerpt:
      "Explorando árboles y grafos en profundidad: cómo estas estructuras de datos complejas pueden optimizar tus algoritmos.",
    votes: 15,
    comments: 8,
    image: "/placeholder-post-image.jpeg",
    tags: ["Estructuras de Datos", "Avanzado"],
  },
  {
    id: 3,
    title: "Algoritmos de Ordenamiento",
    excerpt: "Comparación de diferentes métodos de ordenamiento: desde el simple burbuja hasta el eficiente quicksort.",
    votes: 7,
    comments: 3,
    image: "/placeholder-post-image.jpeg",
    tags: ["Algoritmos", "Ordenamiento"],
  },
  {
    id: 4,
    title: "Introducción a la Inteligencia Artificial",
    excerpt: "Descubre los conceptos básicos de la IA y cómo está cambiando el mundo de la tecnología.",
    votes: 20,
    comments: 12,
    image: "/placeholder-post-image.jpeg",
    tags: ["IA", "Machine Learning"],
  },
  {
    id: 5,
    title: "Desarrollo Web Moderno",
    excerpt: "Explora las últimas tendencias y tecnologías en el desarrollo web frontend y backend.",
    votes: 18,
    comments: 9,
    image: "/placeholder-post-image.jpeg",
    tags: ["Web", "Frontend", "Backend"],
  },
  {
    id: 6,
    title: "Seguridad Informática",
    excerpt: "Aprende sobre las mejores prácticas para proteger tus aplicaciones y datos contra amenazas cibernéticas.",
    votes: 14,
    comments: 7,
    image: "/placeholder-post-image.jpeg",
    tags: ["Seguridad", "Ciberseguridad"],
  },
]

const POSTS_PER_PAGE = 6

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const indexOfLastPost = currentPage * POSTS_PER_PAGE
  const indexOfFirstPost = indexOfLastPost - POSTS_PER_PAGE
  const currentPosts = mockPosts.slice(indexOfFirstPost, indexOfLastPost)

  const totalPages = Math.ceil(mockPosts.length / POSTS_PER_PAGE)

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    setIsLoading(true)
    // Simulate loading delay when changing pages
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const recommendedPosts = mockPosts.slice(0, 3)

  return (
    <>
      <Hero />
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row gap-8">
          <main className="w-full lg:w-2/3">
            <div className="mb-12">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl mb-2">Publicaciones Recientes</h2>
              <div className="flex items-center gap-2">
                <div className="h-1 w-12 bg-primary rounded"></div>
                <span className="text-sm font-medium text-muted-foreground">
                  Explora nuestro contenido más reciente
                </span>
                <div className="h-1 w-12 bg-primary rounded"></div>
              </div>
            </div>
            <BlogList posts={currentPosts} isLoading={isLoading} />
            <div className="mt-8">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          </main>
          <aside className="w-full lg:w-1/3">
            <div className="lg:sticky lg:top-24">
              <Sidebar recommendedPosts={recommendedPosts} />
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}

