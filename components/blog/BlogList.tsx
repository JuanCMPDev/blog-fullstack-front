import React from "react"
import { BlogPost } from "./BlogPost"
import { Skeleton } from "@/components/ui/skeleton"
import { BlogListProps } from "@/lib/types"
import { EmptyState } from "@/components/common/EmptyState"
import { FileText } from "lucide-react"

export function BlogList({ posts, isLoading, activeTag }: BlogListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, index) => (
          <Skeleton key={index} className="h-[300px] w-full" />
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title={
          activeTag
            ? `No hay publicaciones con el tag "${activeTag}"`
            : "No hay publicaciones disponibles"
        }
        description={
          activeTag
            ? "Prueba con otro tag o explora todas las publicaciones."
            : "Pronto habrá nuevo contenido. ¡Vuelve pronto!"
        }
        action={activeTag ? undefined : { label: "Explorar cursos", href: "/courses" }}
      />
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
