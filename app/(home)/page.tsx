"use client"

import { useState, useEffect, useCallback } from "react"
import { BlogList } from "@/components/blog/BlogList"
import { Pagination } from "@/components/common/Pagination"
import { Hero } from "@/components/common/Hero"
import { FeaturedCourses } from "@/components/common/FeaturedCourses"
import { ContinueLearning } from "@/components/common/ContinueLearning"
import { TagFilters } from "@/components/common/TagFilters"
import { Sidebar } from "@/components/layout/Sidebar"
import { EmptyState } from "@/components/common/EmptyState"
import { motion, AnimatePresence } from "framer-motion"
import { Post, PostStatus } from "@/lib/types"
import { customFetch } from "@/lib/customFetch"
import { buildApiUrl } from "@/lib/api"
import { AlertTriangle } from "lucide-react"

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
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = useCallback(async (page: number, tag: string | null) => {
    setIsLoading(true)
    setError(null)
    try {
      let endpoint: string
      if (tag) {
        endpoint = buildApiUrl(
          `posts/search?page=${page}&limit=${POSTS_PER_PAGE}&status=${PostStatus.PUBLISHED}&tags=${encodeURIComponent(tag)}`
        )
      } else {
        endpoint = buildApiUrl(
          `posts?page=${page}&limit=${POSTS_PER_PAGE}&status=${PostStatus.PUBLISHED}`
        )
      }

      const response = await customFetch(endpoint)

      if (!response.ok) {
        throw new Error(`Error al cargar los posts: ${response.statusText}`)
      }

      const data: PostsResponse = await response.json()

      setPosts(data.data)
      setTotalPages(data.meta.lastPage)
    } catch (err) {
      console.error("Error al cargar los posts:", err)
      setError(err instanceof Error ? err.message : "Error al cargar las publicaciones")
      setPosts([])
      setTotalPages(1)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts(currentPage, activeTag)
  }, [currentPage, activeTag, fetchPosts])

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleTagChange = (tag: string | null) => {
    setActiveTag(tag)
    setCurrentPage(1)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-dot-pattern">
      {/* Background orbs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-24 right-[-8rem] h-[30rem] w-[30rem] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute top-[35%] left-[-10rem] h-[26rem] w-[26rem] rounded-full bg-secondary/40 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[20%] h-[18rem] w-[18rem] rounded-full bg-primary/10 blur-2xl" />
      </div>

      <div className="relative z-10">
        <Hero />
        <FeaturedCourses />
        <ContinueLearning />
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            <main className="w-full lg:w-2/3">
              <div className="mb-8">
                <h2 className="text-3xl font-headline font-extrabold tracking-tight sm:text-4xl mb-3">
                  Publicaciones Recientes
                </h2>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-0.5 w-16 bg-gradient-to-r from-primary to-primary/30 rounded-full"></div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {activeTag ? `Filtrado por: ${activeTag}` : "Nuestros últimos artículos"}
                  </span>
                  <div className="h-0.5 w-16 bg-gradient-to-l from-primary to-primary/30 rounded-full"></div>
                </div>
                <TagFilters activeTag={activeTag} onTagChange={handleTagChange} />
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${currentPage}-${activeTag}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {error && !isLoading ? (
                    <EmptyState
                      icon={AlertTriangle}
                      title="Error al cargar las publicaciones"
                      description="No se pudieron obtener los artículos. Verifica tu conexión e intenta de nuevo."
                      action={{ label: "Reintentar", onClick: () => fetchPosts(currentPage, activeTag) }}
                    />
                  ) : (
                    <BlogList posts={posts} isLoading={isLoading} activeTag={activeTag} />
                  )}
                </motion.div>
              </AnimatePresence>
              {totalPages > 1 && !error && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  className="mt-8"
                />
              )}
            </main>
            <aside className="w-full lg:w-1/3">
              <div className="lg:sticky lg:top-24">
                <Sidebar />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
