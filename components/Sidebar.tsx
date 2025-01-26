'use client'

import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { TrendingUp, Hash, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getRecommendedPosts } from "@/lib/mock-posts"
import type { Post } from "@/lib/types"

interface Category {
  name: string
  slug: string
  count: number
}

const defaultCategories: Category[] = [
  { name: "JavaScript", slug: "javascript", count: 15 },
  { name: "React", slug: "react", count: 12 },
  { name: "Node.js", slug: "nodejs", count: 8 },
  { name: "CSS", slug: "css", count: 10 },
  { name: "TypeScript", slug: "typescript", count: 7 },
]

interface SidebarProps {
  categories?: Category[]
}

export function Sidebar({ categories = defaultCategories }: SidebarProps) {
  const [recommendedPosts, setRecommendedPosts] = useState<Post[]>([])

  useEffect(() => {
    const fetchRecommendedPosts = async () => {
      // En un escenario real, esto sería una llamada a la API
      const posts = getRecommendedPosts()
      setRecommendedPosts(posts)
    }

    fetchRecommendedPosts()
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
                    <span>{new Date(post.publishDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/posts"
          className="inline-flex items-center justify-center w-full mt-4 px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-md hover:bg-primary/20 transition-colors"
        >
          Ver todos los posts
          <ChevronRight className="ml-2 h-4 w-4" />
        </Link>
      </div>

      <div className="bg-gradient-to-br from-accent/50 to-accent rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <Hash className="mr-2 h-6 w-6 text-primary" />
          Categorías Populares
        </h2>
        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/category/${category.slug}`}
                className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-accent/50 transition-colors group"
              >
                <span className="text-sm font-medium group-hover:text-primary transition-colors">{category.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/categories"
          className="inline-flex items-center justify-center w-full mt-4 px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-md hover:bg-primary/20 transition-colors"
        >
          Ver todas las categorías
          <ChevronRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

