"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { BlogList } from "@/components/BlogList"
import { Pagination } from "@/components/Pagination"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, SortAsc, SortDesc } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Post } from "@/lib/types"

// Simulación de posts para la búsqueda
const allPosts: Post[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  title: `Post ${i + 1}`,
  image: `/images/cover-${i + 1}.jpg`,
  excerpt: `Este es un resumen del post ${i + 1}. Contiene información relevante sobre el tema.`,
  content: `Contenido completo del post ${i + 1}. Aquí iría todo el texto del artículo.`,
  author: {
    id: `author-${(i % 5) + 1}`,
    name: `Autor ${(i % 5) + 1}`,
    avatar: `/avatars/avatar-${(i % 5) + 1}.jpg`,
  },
  coverImage: `/images/cover-${i + 1}.jpg`,
  date: new Date(Date.now() - i * 86400000).toISOString(),
  publishDate: new Date(Date.now() - i * 86400000).toISOString(),
  readTime: Math.floor(Math.random() * 10) + 5,
  likes: Math.floor(Math.random() * 100),
  comments: Math.floor(Math.random() * 20),
  tags: [`Tag${(i % 3) + 1}`, `Tag${(i % 3) + 2}`],
}))

const POSTS_PER_PAGE = 10

type SortOption = "date" | "votes" | "comments"
type SortOrder = "asc" | "desc"

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const page = Number(searchParams.get("page")) || 1

  const [searchTerm, setSearchTerm] = useState(query)
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>("date")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  useEffect(() => {
    setSearchTerm(query)
    setIsLoading(true)
    // Simular una carga de datos
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/search?q=${encodeURIComponent(searchTerm)}`)
  }

  const filteredPosts = useMemo(() => {
    return allPosts
      .filter(
        (post) =>
          post.title.toLowerCase().includes(query.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(query.toLowerCase()) ||
          post.content.toLowerCase().includes(query.toLowerCase()),
      )
      .sort((a, b) => {
        if (sortBy === "date") {
          return sortOrder === "asc"
            ? new Date(a.date).getTime() - new Date(b.date).getTime()
            : new Date(b.date).getTime() - new Date(a.date).getTime()
        } else if (sortBy === "votes") {
          return sortOrder === "asc" ? a.likes - b.likes : b.likes - a.likes
        } else {
          return sortOrder === "asc" ? a.comments - b.comments : b.comments - a.comments
        }
      })
  }, [query, sortBy, sortOrder])

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  const currentPosts = filteredPosts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE)

  const handlePageChange = (newPage: number) => {
    router.push(`/search?q=${encodeURIComponent(query)}&page=${newPage}`)
  }

  const handleSortChange = (value: SortOption) => {
    setSortBy(value)
  }

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Resultados de búsqueda</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Búsqueda y Ordenación</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Input
                  type="search"
                  placeholder="Buscar posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              </div>
              <Button type="submit">Buscar</Button>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-1/3">
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Fecha</SelectItem>
                    <SelectItem value="votes">Votos</SelectItem>
                    <SelectItem value="comments">Comentarios</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={toggleSortOrder} className="w-full sm:w-auto">
                {sortOrder === "asc" ? <SortAsc className="mr-2" /> : <SortDesc className="mr-2" />}
                {sortOrder === "asc" ? "Ascendente" : "Descendente"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {query && (
        <p className="text-lg mb-4">
          Mostrando resultados para: <span className="font-semibold">{query}</span>
        </p>
      )}

      <p className="text-sm text-muted-foreground mb-4">{filteredPosts.length} resultados encontrados</p>

      <AnimatePresence mode="wait">
        <motion.div
          key={page + query + sortBy + sortOrder}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <BlogList posts={currentPosts} isLoading={isLoading} />
        </motion.div>
      </AnimatePresence>

      {filteredPosts.length > POSTS_PER_PAGE && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} className="mt-8" />
      )}

      {!isLoading && filteredPosts.length === 0 && (
        <p className="text-center text-lg text-muted-foreground mt-8">No se encontraron resultados para tu búsqueda.</p>
      )}
    </div>
  )
}

