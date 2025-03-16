'use client'

import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { TrendingUp, Hash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getRecommendedPosts } from "@/lib/services/postService"
import type { Post } from "@/lib/types"
import { customFetch } from "@/lib/customFetch"

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
      // En un escenario real, esto sería una llamada a la API
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
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-accent/50 to-accent rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <TrendingUp className="mr-2 h-6 w-6 text-primary" />
          Posts Recomendados
        </h2>
        <ul className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="w-16 h-16 bg-accent-foreground/10 rounded-md"></div>
                    <div className="flex-grow">
                      <div className="h-4 bg-accent-foreground/10 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-accent-foreground/10 rounded w-full mb-2"></div>
                      <div className="h-3 bg-accent-foreground/10 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : recommendedPosts.length > 0 ? (
            recommendedPosts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/post/${post.slug}`}
                  className="group flex items-start space-x-3 hover:bg-accent/50 p-2 rounded-md transition-colors"
                >
                  <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={post.coverImage || "/placeholder-post-image.jpeg"}
                      alt={post.title}
                      fill
                      sizes="(max-width: 64px) 100vw, 64px"
                      className="object-cover transition-transform group-hover:scale-110"
                    />
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{post.excerpt}</p>
                    <div className="flex items-center mt-1 text-xs text-muted-foreground">
                      <span>{post.author.name}</span>
                      <span className="mx-1">•</span>
                      <span>{new Date(post.publishDate as string).toLocaleDateString('ES-co')}</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No hay posts recomendados disponibles
            </div>
          )}
        </ul>
      </div>

      <div className="bg-gradient-to-br from-accent/50 to-accent rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <Hash className="mr-2 h-6 w-6 text-primary" />
          Tags Populares
        </h2>
        <ul className="space-y-2">
          {loadingTags ? (
            <div className="animate-pulse space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3">
                  <div className="h-4 bg-accent-foreground/10 rounded w-24"></div>
                  <div className="h-5 bg-accent-foreground/10 rounded w-8"></div>
                </div>
              ))}
            </div>
          ) : popularTags.length > 0 ? (
            popularTags.map((tag) => (
              <li key={tag.slug}>
                <Link
                  href={`/search?tags=${encodeURIComponent(tag.name)}`}
                  className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-accent/50 transition-colors group"
                >
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">{tag.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {tag.count}
                  </Badge>
                </Link>
              </li>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No hay tags populares disponibles
            </div>
          )}
        </ul>
      </div>
    </div>
  )
}

