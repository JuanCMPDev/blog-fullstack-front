'use client'

import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { TrendingUp, Hash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { getRecommendedPosts } from "@/lib/services/postService"
import type { Post } from "@/lib/types"
import { customFetch } from "@/lib/customFetch"
import { Skeleton } from "@/components/ui/skeleton"

interface Category {
  name: string
  slug: string
  count: number
}

interface PopularTag {
  tag: string
  count: number
}

export function Sidebar() {
  const [recommendedPosts, setRecommendedPosts] = useState<Post[]>([])
  const [popularTags, setPopularTags] = useState<Category[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [loadingTags, setLoadingTags] = useState<boolean>(true)

  // Función para obtener la URL base de la API
  const getBaseUrl = () => {
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    if (apiUrl.endsWith('/')) {
      apiUrl = apiUrl.slice(0, -1)
    }
    return apiUrl
  }

  useEffect(() => {
    const fetchRecommendedPosts = async () => {
      try {
        setLoading(true)
        const posts = await getRecommendedPosts(3)
        setRecommendedPosts(posts)
      } catch (error) {
        console.error("Error al obtener posts recomendados:", error)
      } finally {
        setLoading(false)
      }
    }

    const fetchPopularTags = async () => {
      try {
        setLoadingTags(true)
        const apiUrl = getBaseUrl()
        const response = await customFetch(`${apiUrl}/posts/popular-tags`)
        
        if (!response.ok) {
          throw new Error(`Error al cargar los tags populares: ${response.statusText}`)
        }
        
        const data: PopularTag[] = await response.json()
        
        // Transformar datos al formato que espera el componente
        const formattedTags = data.map(item => ({
          name: item.tag,
          slug: item.tag.toLowerCase(),
          count: item.count
        }))
        
        setPopularTags(formattedTags)
      } catch (error) {
        console.error("Error al obtener tags populares:", error)
        setPopularTags([])
      } finally {
        setLoadingTags(false)
      }
    }

    fetchRecommendedPosts()
    fetchPopularTags()
  }, [])

  return (
    <div className="space-y-6">
      {/* Sección de Posts Recomendados */}
      <Card className="overflow-hidden border-border/50">
        <CardHeader className="bg-muted/50 pb-3 pt-4 px-5">
          <CardTitle className="text-base font-semibold flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-primary" />
            Posts Recomendados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-3">
          <div className="space-y-0.5">
            {loading ? (
              <div className="space-y-3 p-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="w-12 h-12 rounded-md" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recommendedPosts.length > 0 ? (
              <div className="divide-y divide-border/30">
                {recommendedPosts.map((post) => (
                  <Link 
                    href={`/post/${post.slug}`}
                    key={post.id} 
                    className="group flex items-start gap-3 p-3 hover:bg-accent/20 rounded-md transition-colors"
                  >
                    <div className="relative w-12 h-12 flex-shrink-0 overflow-hidden rounded-md border border-border/40">
                      <Image
                        src={post.coverImage || "/placeholder-post-image.jpeg"}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        sizes="48px"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-card-foreground group-hover:text-primary truncate transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center mt-1 text-xs text-muted-foreground/70">
                        <span className="font-medium">{post.author.name}</span>
                        <span className="mx-1.5 inline-block w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                        <span>{new Date(post.publishDate as string).toLocaleDateString('ES-co')}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-sm text-center py-3 text-muted-foreground/70 border border-dashed border-border/40 rounded-md">
                No hay posts recomendados disponibles
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sección de Tags Populares */}
      <Card className="overflow-hidden border-border/50">
        <CardHeader className="bg-muted/50 pb-3 pt-4 px-5">
          <CardTitle className="text-base font-semibold flex items-center">
            <Hash className="w-4 h-4 mr-2 text-primary" />
            Tags Populares
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-3">
          {loadingTags ? (
            <div className="flex flex-wrap gap-2 p-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-7 w-16 rounded-full" />
              ))}
            </div>
          ) : popularTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <Link
                  key={tag.slug}
                  href={`/search?tags=${encodeURIComponent(tag.name)}`}
                  className="group"
                >
                  <Badge 
                    variant="outline" 
                    className="px-3 py-1 bg-accent/10 hover:bg-accent/20 transition-all duration-200"
                  >
                    <span className="mr-1.5">
                      {tag.name}
                    </span>
                    <span className="inline-flex items-center justify-center bg-primary/10 text-primary text-[10px] font-medium h-4 min-w-4 rounded-full px-1 group-hover:bg-primary/20">
                      {tag.count}
                    </span>
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-sm text-center py-3 text-muted-foreground/70 border border-dashed border-border/40 rounded-md">
              No hay tags populares disponibles
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

