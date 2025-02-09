"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, FileText, Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PostsTable } from "@/components/admin/PostsTable"
import { mockPosts } from "@/lib/mock-posts"
import type { Post } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ManagePostsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [posts, setPosts] = useState<Post[]>(mockPosts)
  const [showDrafts, setShowDrafts] = useState(false)

  const filteredPosts = posts.filter(
    (post) =>
      (post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (showDrafts ? post.publishDate === null : post.publishDate !== null),
  )

  const handleDelete = (postId: number) => {
    setPosts(posts.filter((post) => post.id !== postId))
    // Aquí iría la lógica para eliminar el post en el backend
  }

  const handleEdit = (postId: number) => {
    router.push(`/admin/posts/edit/${postId}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="bg-gradient-to-br from-background to-secondary/20">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Administrar Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-2">
              <Button variant={showDrafts ? "outline" : "default"} onClick={() => setShowDrafts(false)}>
                <FileText className="mr-2 h-4 w-4" />
                Posts Publicados
              </Button>
              <Button variant={showDrafts ? "default" : "outline"} onClick={() => setShowDrafts(true)}>
                <Archive className="mr-2 h-4 w-4" />
                Borradores
              </Button>
            </div>
            <Button onClick={() => router.push("/admin/posts/create")}>
              <Plus className="mr-2 h-4 w-4" /> Crear Nuevo Post
            </Button>
          </div>

          <div className="mb-4">
            <Input
              type="text"
              placeholder="Buscar posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <PostsTable posts={filteredPosts} onDelete={handleDelete} onEdit={handleEdit} />
        </CardContent>
      </Card>
    </div>
  )
}

