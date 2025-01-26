import React from "react"
import { BlogPost } from "./BlogPost"
import { Skeleton } from "@/components/ui/skeleton"
import { BlogListProps } from "@/lib/types"

export function BlogList({ posts, isLoading }: BlogListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, index) => (
          <Skeleton key={index} className="h-[300px] w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {posts.map((post) => (
        <BlogPost key={post.id} {...post} />
      ))}
    </div>
  )
}

