"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { BlogList } from "@/components/BlogList"
import { Pagination } from "@/components/Pagination"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, SortAsc, SortDesc, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { mockPosts } from "@/lib/mock-posts"
import { Sidebar } from "@/components/Sidebar"
import { Badge } from "@/components/ui/badge"

const POSTS_PER_PAGE = 6

type SortOption = "date" | "votes" | "comments"
type SortOrder = "asc" | "desc"

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const tags = useMemo(() => searchParams.get("tags")?.split(",").filter(Boolean) || [], [searchParams])
  const page = Number(searchParams.get("page")) || 1

  const [searchTerm, setSearchTerm] = useState(query)
  const [selectedTags, setSelectedTags] = useState<string[]>(tags)
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>("date")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  useEffect(() => {
    setSearchTerm(query)
    setSelectedTags(tags)
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [query, tags])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateSearch(searchTerm, selectedTags)
  }

  const updateSearch = (newQuery: string, newTags: string[]) => {
    const params = new URLSearchParams()
    if (newQuery) params.set("q", newQuery)
    if (newTags.length > 0) params.set("tags", newTags.join(","))
    router.push(`/search?${params.toString()}`)
  }

  const handleTagRemove = (tagToRemove: string) => {
    const newTags = selectedTags.filter((tag) => tag !== tagToRemove)
    updateSearch(searchTerm, newTags)
  }

  const filteredPosts = useMemo(() => {
    return mockPosts
      .filter((post) => {
        const searchRegex = new RegExp(query, "i")
        const matchesSearch =
          searchRegex.test(post.title) ||
          searchRegex.test(post.excerpt) ||
          searchRegex.test(post.content) ||
          searchRegex.test(post.author.name)
        const matchesTags = selectedTags.length === 0 || selectedTags.every((tag) => post.tags.includes(tag))
        return matchesSearch && matchesTags
      })
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
  }, [query, selectedTags, sortBy, sortOrder])

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  const currentPosts = filteredPosts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE)

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    router.push(`/search?${params.toString()}`)
  }

  const handleSortChange = (value: SortOption) => {
    setSortBy(value)
  }

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
  }

  return (
    <div className="bg-dot-pattern">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <main className="w-full lg:w-2/3">
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
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-4 w-4 p-0"
                          onClick={() => handleTagRemove(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
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

            {(query || selectedTags.length > 0) && (
              <p className="text-lg mb-4">
                Mostrando resultados para:
                <span className="font-semibold">
                  {query && ` "${query}"`}
                  {selectedTags.length > 0 && ` en ${selectedTags.join(", ")}`}
                </span>
              </p>
            )}

            <p className="text-sm text-muted-foreground mb-4">{filteredPosts.length} resultados encontrados</p>

            <AnimatePresence mode="wait">
              <motion.div
                key={page + query + selectedTags.join(",") + sortBy + sortOrder}
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
              <p className="text-center text-lg text-muted-foreground mt-8">
                No se encontraron resultados para tu búsqueda.
              </p>
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

