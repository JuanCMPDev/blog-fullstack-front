"use client"

import { useState, useEffect, useMemo, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { BlogList } from "@/components/blog/BlogList"
import { Pagination } from "@/components/common/Pagination"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, SortAsc, SortDesc, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Sidebar } from "@/components/layout/Sidebar"
import { Badge } from "@/components/ui/badge"
import { Post, PostStatus } from "@/lib/types"
import { customFetch } from "@/lib/customFetch"

const POSTS_PER_PAGE = 6

type SortOption = "date" | "votes" | "comments"
type SortOrder = "asc" | "desc"

interface PostsResponse {
  data: Post[]
  meta: {
    total: number
    page: number
    lastPage: number
    limit: number
  }
}

// Mapeo de opciones de ordenación internas a valores de API
const sortOptionsMap = {
  date: "publishDate",
  votes: "likes",
  comments: "comments"
};

function SearchPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const tags = useMemo(() => searchParams.get("tags")?.split(",").filter(Boolean) || [], [searchParams])
  const pageParam = Number(searchParams.get("page")) || 1
  const sortByParam = searchParams.get("sortBy") as SortOption || "date"
  const sortOrderParam = searchParams.get("sortOrder") as SortOrder || "desc"

  const [searchTerm, setSearchTerm] = useState(query)
  const [selectedTags, setSelectedTags] = useState<string[]>(tags)
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>(sortByParam)
  const [sortOrder, setSortOrder] = useState<SortOrder>(sortOrderParam)
  
  const [posts, setPosts] = useState<Post[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(pageParam)

  // Función para obtener la URL base de la API
  const getBaseUrl = () => {
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    if (apiUrl.endsWith('/')) {
      apiUrl = apiUrl.slice(0, -1)
    }
    return apiUrl
  }

  const fetchPosts = useCallback(async () => {
    setIsLoading(true)
    try {
      const apiUrl = getBaseUrl()
      
      // Construir parámetros de la URL
      const params = new URLSearchParams()
      
      // Agregar término de búsqueda si existe
      if (query) {
        params.set('searchTerm', query)
      }
      
      // Agregar tags si existen (como formato JSON)
      if (selectedTags.length > 0) {
        params.set('tags', JSON.stringify(selectedTags))
      }
      
      // Establecer estado a PUBLISHED
      params.set('status', PostStatus.PUBLISHED)
      
      // Paginación
      params.set('page', currentPage.toString())
      params.set('limit', POSTS_PER_PAGE.toString())
      
      // Ordenamiento - Mapear nuestras opciones al formato de la API
      const apiSortField = sortOptionsMap[sortBy]
      params.set('orderBy', apiSortField)
      params.set('order', sortOrder)
      
      const endpoint = `${apiUrl}/posts/search?${params.toString()}`
      console.log("Búsqueda con:", endpoint)
      
      const response = await customFetch(endpoint)
      
      if (!response.ok) {
        throw new Error(`Error al buscar posts: ${response.statusText}`)
      }
      
      const data: PostsResponse = await response.json()
      
      setPosts(data.data)
      setTotalResults(data.meta.total)
      setTotalPages(data.meta.lastPage)
    } catch (error) {
      console.error("Error al buscar posts:", error)
      setPosts([])
      setTotalResults(0)
      setTotalPages(1)
    } finally {
      setIsLoading(false)
    }
  }, [query, selectedTags, currentPage, sortBy, sortOrder]);

  // Sincronizar estados con parámetros de URL
  useEffect(() => {
    setSearchTerm(query)
    setSelectedTags(tags)
    setCurrentPage(pageParam)
    setSortBy(sortByParam)
    setSortOrder(sortOrderParam)
  }, [query, tags, pageParam, sortByParam, sortOrderParam])

  // Efecto para realizar la búsqueda cuando cambian las dependencias
  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // Actualizar la URL y mantener los parámetros de búsqueda
  const updateUrlParams = useCallback((params: {
    query?: string,
    tags?: string[],
    page?: number,
    sortBy?: SortOption,
    sortOrder?: SortOrder
  }) => {
    const urlParams = new URLSearchParams(searchParams.toString())
    
    // Solo actualizar los parámetros proporcionados
    if (params.query !== undefined) {
      if (params.query) urlParams.set("q", params.query)
      else urlParams.delete("q")
    }
    
    if (params.tags !== undefined) {
      if (params.tags && params.tags.length > 0) urlParams.set("tags", params.tags.join(","))
      else urlParams.delete("tags")
    }
    
    if (params.page !== undefined) {
      urlParams.set("page", params.page.toString())
    }
    
    if (params.sortBy !== undefined) {
      urlParams.set("sortBy", params.sortBy)
    }
    
    if (params.sortOrder !== undefined) {
      urlParams.set("sortOrder", params.sortOrder)
    }
    
    // Actualizar URL sin causar navegación completa
    const url = `/search?${urlParams.toString()}`
    router.push(url, { scroll: false })
  }, [searchParams, router])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Actualizar estados locales
    setSortBy(sortBy)
    setSortOrder(sortOrder)
    setCurrentPage(1)
    
    // Actualizar URL
    updateUrlParams({
      query: searchTerm,
      tags: selectedTags,
      page: 1,
      sortBy,
      sortOrder
    })
  }

  const handleTagRemove = (tagToRemove: string) => {
    const newTags = selectedTags.filter((tag) => tag !== tagToRemove)
    setSelectedTags(newTags)
    setCurrentPage(1)
    
    updateUrlParams({
      tags: newTags,
      page: 1
    })
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    updateUrlParams({ page: newPage })
  }

  const handleSortChange = (value: SortOption) => {
    setSortBy(value)
    updateUrlParams({ sortBy: value })
  }

  const toggleSortOrder = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc"
    setSortOrder(newSortOrder)
    updateUrlParams({ sortOrder: newSortOrder })
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
                          size="icon"
                          className="h-4 w-4 ml-1 p-0 hover:bg-transparent"
                          onClick={() => handleTagRemove(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="mb-6 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <p className="text-muted-foreground text-sm">
                  {isLoading 
                    ? "Cargando resultados..." 
                    : totalResults === 0 
                      ? "No se encontraron resultados" 
                      : `${totalResults} resultados encontrados`
                  }
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={(value) => handleSortChange(value as SortOption)}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Fecha</SelectItem>
                    <SelectItem value="votes">Votos</SelectItem>
                    <SelectItem value="comments">Comentarios</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={toggleSortOrder}
                  title={sortOrder === "asc" ? "Ascendente" : "Descendente"}
                >
                  {sortOrder === "asc" ? <SortAsc /> : <SortDesc />}
                </Button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${query}-${selectedTags.join('')}-${currentPage}-${sortBy}-${sortOrder}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <BlogList 
                  posts={posts} 
                  isLoading={isLoading}
                />
              </motion.div>
            </AnimatePresence>

            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination 
                  currentPage={currentPage} 
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </main>

          <aside className="w-full lg:w-1/3">
            <Sidebar />
          </aside>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Cargando búsqueda...</div>}>
      <SearchPageContent />
    </Suspense>
  )
}

