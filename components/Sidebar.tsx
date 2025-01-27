'use client'

import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { TrendingUp, Hash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getRecommendedPosts, mockPosts } from "@/lib/mock-posts"
import type { Post } from "@/lib/types"

interface Category {
  name: string
  slug: string
  count: number
}

export function Sidebar() {
  const [recommendedPosts, setRecommendedPosts] = useState<Post[]>([])
  const [popularTags, setPopularTags] = useState<Category[]>([])

  useEffect(() => {
    const fetchRecommendedPosts = async () => {
      // En un escenario real, esto sería una llamada a la API
      const posts = getRecommendedPosts()
      setRecommendedPosts(posts)
    }

    const getPopularTags = () => {
      const tagCounts: { [key: string]: number } = {}
      mockPosts.forEach((post) => {
        post.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      })
      const sortedTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, slug: name.toLowerCase(), count }))
      setPopularTags(sortedTags)
    }

    fetchRecommendedPosts()
    getPopularTags()
  }, [])

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-accent/50 to-accent rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <TrendingUp className="mr-2 h-6 w-6 text-primary" />
          Posts Recomendados
        </h2>
        <ul className="space-y-4">
          {recommendedPosts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/post/${post.id}`}
                className="group flex items-start space-x-3 hover:bg-accent/50 p-2 rounded-md transition-colors"
              >
                <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={post.image || "/placeholder-post-image.jpeg"}
                    alt={post.title}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform group-hover:scale-110"
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
                    <span>{new Date(post.publishDate).toLocaleDateString('ES-co')}</span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-gradient-to-br from-accent/50 to-accent rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <Hash className="mr-2 h-6 w-6 text-primary" />
          Tags Populares
        </h2>
        <ul className="space-y-2">
          {popularTags.map((tag) => (
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
          ))}
        </ul>
      </div>
    </div>
  )
}

