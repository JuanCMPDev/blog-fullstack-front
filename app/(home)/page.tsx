"use client"

import { useState, useEffect } from "react"
import { BlogList } from "@/components/BlogList"
import { Pagination } from "@/components/Pagination"
import { Hero } from "@/components/Hero"
import { Sidebar } from "@/components/Sidebar"
import { motion, AnimatePresence } from "framer-motion"
import { mockPosts } from "@/lib/mock-posts"

const POSTS_PER_PAGE = 6

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const sortedPosts = [...mockPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const currentPosts = sortedPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE)

  const totalPages = Math.ceil(sortedPosts.length / POSTS_PER_PAGE)

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    setIsLoading(true)
    // Simulate loading delay when changing pages
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <>
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
                <BlogList posts={currentPosts} isLoading={isLoading} />
              </motion.div>
            </AnimatePresence>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              className="mt-8"
            />
          </main>
          <aside className="w-full lg:w-1/3">
            <div className="lg lg:top-24">
              <Sidebar />
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}

