'use client'

import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { TrendingUp, Hash, ArrowRight, ThumbsUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { getRecommendedPosts } from "@/lib/services/postService"
import type { Post } from "@/lib/types"
import { customFetch } from "@/lib/customFetch"
import { buildApiUrl } from "@/lib/api"
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
        const response = await customFetch(buildApiUrl("posts/popular-tags"))

        if (!response.ok) {
          throw new Error(`Error al cargar los tags populares: ${response.statusText}`)
        }

        const data: PopularTag[] = await response.json()

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
      {/* Posts Recomendados */}
      <Card className="overflow-hidden glass-card border-border/30">
        <CardHeader className="bg-gradient-to-r from-primary/8 to-primary/3 pb-3 pt-4 px-5 border-b border-border/20">
          <CardTitle className="text-sm font-headline font-semibold flex items-center">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 mr-2">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
            </div>
            Posts Recomendados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-20 h-14 rounded-lg flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : recommendedPosts.length > 0 ? (
            <div>
              {recommendedPosts.map((post, index) => (
                <Link
                  href={`/post/${post.slug}`}
                  key={post.id}
                  className="group flex gap-3 p-4 hover:bg-primary/5 transition-all duration-200 border-b border-border/10 last:border-b-0"
                >
                  {/* Thumbnail */}
                  <div className="relative w-20 h-14 flex-shrink-0 overflow-hidden rounded-lg border border-border/30">
                    <Image
                      src={post.coverImage || "/placeholder-post-image.jpeg"}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="80px"
                    />
                    {/* Position badge */}
                    <div className="absolute top-0 left-0 bg-primary/90 text-primary-foreground text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-br-md">
                      {index + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3 className="font-medium text-sm leading-tight text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[11px] text-muted-foreground/70 truncate">{post.author.name}</span>
                      {post.likes > 0 && (
                        <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground/50">
                          <ThumbsUp className="h-2.5 w-2.5" />
                          {post.likes}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="h-4 w-4 text-muted-foreground/30 self-center flex-shrink-0 transition-all duration-200 group-hover:text-primary group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-sm text-center py-6 px-4 text-muted-foreground/70">
              No hay posts recomendados disponibles
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tags Populares */}
      <Card className="overflow-hidden glass-card border-border/30">
        <CardHeader className="bg-gradient-to-r from-primary/8 to-primary/3 pb-3 pt-4 px-5 border-b border-border/20">
          <CardTitle className="text-sm font-headline font-semibold flex items-center">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 mr-2">
              <Hash className="w-3.5 h-3.5 text-primary" />
            </div>
            Tags Populares
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {loadingTags ? (
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-full" />
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
                    className="px-3 py-1.5 bg-secondary/30 border-border/30 hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-all duration-200 cursor-pointer"
                  >
                    <Hash className="h-3 w-3 mr-1 text-muted-foreground/50 group-hover:text-primary/70" />
                    <span className="mr-1.5 text-xs">
                      {tag.name}
                    </span>
                    <span className="inline-flex items-center justify-center bg-primary/10 text-primary text-[10px] font-semibold h-4 min-w-5 rounded-full px-1.5 group-hover:bg-primary/20">
                      {tag.count}
                    </span>
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-sm text-center py-4 text-muted-foreground/70">
              No hay tags populares disponibles
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
