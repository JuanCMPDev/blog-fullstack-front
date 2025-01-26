"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Heart, MessageCircle, Share2, Bookmark, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { CodeBlock } from "@/components/CodeBlock"
import { Comments } from "@/components/Comments"
import { mockPosts } from "@/lib/mock-posts"
import type { Post } from "@/lib/types"

const mockComments = [
  {
    id: "1",
    author: { id: "user1", name: "Juan Pérez", avatar: "/placeholder.svg?height=40&width=40" },
    content: "¡Excelente artículo! Me ha ayudado mucho a entender los conceptos.",
    likes: 5,
    replies: [
      {
        id: "1-1",
        author: { id: "user2", name: "María González", avatar: "/placeholder.svg?height=40&width=40" },
        content: "¡Gracias Juan! Me alegro de que te haya sido útil.",
        likes: 2,
        replies: [],
        createdAt: "2023-07-16T15:30:00Z",
      },
    ],
    createdAt: "2023-07-16T14:00:00Z",
  },
  {
    id: "2",
    author: { id: "user3", name: "Ana Rodríguez", avatar: "/placeholder.svg?height=40&width=40" },
    content: "¿Podrías hacer un artículo sobre temas más avanzados en este campo?",
    likes: 3,
    replies: [],
    createdAt: "2023-07-17T10:00:00Z",
  },
]

export default function PostPage() {
  const { id } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchPost = () => {
      setIsLoading(true)
      const foundPost = mockPosts.find((p) => p.id === Number(id))
      if (foundPost) {
        setPost(foundPost)
      } else {
        router.push("/404")
      }
      setIsLoading(false)
    }

    fetchPost()
  }, [id, router])

  const renderContent = (content: string) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, "text/html")

    const elements = Array.from(doc.body.childNodes).map((node, index) => {
      if (node.nodeName === "PRE" && node.firstChild?.nodeName === "CODE") {
        const code = node.textContent || ""
        const language = (node.firstChild as HTMLElement).className.replace("language-", "")
        return <CodeBlock key={index} language={language} value={code} />
      }
      return <div key={index} dangerouslySetInnerHTML={{ __html: node instanceof Element ? node.outerHTML : "" }} />
    })

    return elements
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="w-full aspect-video mb-8 rounded-lg" />
        <Skeleton className="w-3/4 h-8 mb-4" />
        <Skeleton className="w-1/2 h-6 mb-8" />
        <div className="space-y-4">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-3/4 h-4" />
        </div>
      </div>
    )
  }

  if (!post) return null

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="relative w-full aspect-video mb-8">
        <Image
          src={post.coverImage || "/placeholder.svg"}
          alt={post.title}
          fill
          className="object-cover rounded-lg shadow-lg"
          priority
        />
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold mb-4">{post.title}</h1>
      <div className="flex items-center space-x-4 mb-6">
        <Avatar className="w-10 h-10">
          <AvatarImage src={post.author.avatar} alt={post.author.name} />
          <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{post.author.name}</p>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span>{format(new Date(post.publishDate), "dd MMMM, yyyy", { locale: es })}</span>
            <span className="mx-2">•</span>
            <Clock className="mr-2 h-4 w-4" />
            <span>{post.readTime} min de lectura</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {post.tags.map((tag: string) => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>
      <div className="prose prose-lg dark:prose-invert max-w-none mb-8">{renderContent(post.content)}</div>
      <div className="flex items-center justify-between border-t border-b py-4 mb-8">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
            <Heart className="h-4 w-4 mr-1 sm:mr-2" />
            <span>{post.likes}</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
            <MessageCircle className="h-4 w-4 mr-1 sm:mr-2" />
            <span>{post.comments}</span>
          </Button>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
            <Share2 className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Compartir</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
            <Bookmark className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Guardar</span>
          </Button>
        </div>
      </div>
      <Comments comments={mockComments} />
    </motion.article>
  )
}

