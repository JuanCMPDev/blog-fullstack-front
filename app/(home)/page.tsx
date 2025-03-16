"use client"

import { useState, useEffect } from "react"
import { BlogList } from "@/components/blog/BlogList"
import { Pagination } from "@/components/common/Pagination"
import { Hero } from "@/components/common/Hero"
import { Sidebar } from "@/components/layout/Sidebar"
import { motion, AnimatePresence } from "framer-motion"
import { Post, PostStatus } from "@/lib/types"
import { customFetch } from "@/lib/customFetch"

const POSTS_PER_PAGE = 6

interface PostsResponse {
  data: Post[]
  meta: {
    total: number
    page: number
    lastPage: number
    limit: number
  }
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState<Post[]>([])
  const [totalPages, setTotalPages] = useState(1)

  // Función para obtener la URL base de la API
  const getBaseUrl = () => {
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    if (apiUrl.endsWith('/')) {
      apiUrl = apiUrl.slice(0, -1)
    }
    return apiUrl
  }

  const fetchPosts = async (page: number) => {
    setIsLoading(true)
    try {
      const apiUrl = getBaseUrl()
      const endpoint = `${apiUrl}/posts?page=${page}&limit=${POSTS_PER_PAGE}&status=${PostStatus.PUBLISHED}`
      
      const response = await customFetch(endpoint)
      
      if (!response.ok) {
        throw new Error(`Error al cargar los posts: ${response.statusText}`)
      }
      
      const data: PostsResponse = await response.json()
      
      setPosts(data.data)
      setTotalPages(data.meta.lastPage)
    } catch (error) {
      console.error("Error al cargar los posts:", error)
      // Manejar el error como prefieras
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts(currentPage)
  }, [currentPage])

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="bg-dot-pattern">
      <Hero />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <main className="w-full lg:w-2/3">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl mb-2">Publicaciones Recientes</h2>
              <div className="flex items-center gap-2">
                <div className="h-1 w-20 bg-primary rounded"></div>
                <span className="text-sm font-medium text-muted-foreground">
                  Nuestros últimos artículos
                </span>
                <div className="h-1 w-20 bg-primary rounded"></div>
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <BlogList posts={posts} isLoading={isLoading} />
              </motion.div>
            </AnimatePresence>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                className="mt-8"
              />
            )}
          </main>
          <aside className="w-full lg:w-1/3">
            <div className="lg lg:top-24">
              <Sidebar />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

