"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { customFetch } from "@/lib/customFetch"
import { buildApiUrl } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

interface PopularTag {
  tag: string
  count: number
}

interface TagFiltersProps {
  activeTag: string | null
  onTagChange: (tag: string | null) => void
}

export function TagFilters({ activeTag, onTagChange }: TagFiltersProps) {
  const [tags, setTags] = useState<PopularTag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await customFetch(buildApiUrl("posts/popular-tags"))
        if (response.ok) {
          const data: PopularTag[] = await response.json()
          setTags(data.slice(0, 8))
        }
      } catch {
        setTags([])
      } finally {
        setLoading(false)
      }
    }
    fetchTags()
  }, [])

  if (loading) {
    return (
      <div className="flex gap-2 flex-wrap mb-6">
        <Skeleton className="h-8 w-16 rounded-full" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
    )
  }

  if (tags.length === 0) return null

  return (
    <div className="flex gap-2 flex-wrap mb-6">
      <Badge
        variant={activeTag === null ? "default" : "outline"}
        className={`cursor-pointer px-4 py-1.5 text-xs rounded-full transition-all hover:scale-105 ${
          activeTag === null ? "" : "border-primary/20 hover:border-primary/40 hover:bg-primary/10"
        }`}
        onClick={() => onTagChange(null)}
      >
        Todos
      </Badge>
      {tags.map((tag) => (
        <Badge
          key={tag.tag}
          variant={activeTag === tag.tag ? "default" : "outline"}
          className={`cursor-pointer px-4 py-1.5 text-xs rounded-full transition-all hover:scale-105 ${
            activeTag === tag.tag ? "" : "border-primary/20 hover:border-primary/40 hover:bg-primary/10"
          }`}
          onClick={() => onTagChange(activeTag === tag.tag ? null : tag.tag)}
        >
          {tag.tag}
        </Badge>
      ))}
    </div>
  )
}
