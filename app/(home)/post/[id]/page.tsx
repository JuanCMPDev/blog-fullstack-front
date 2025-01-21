"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useParams } from "next/navigation"
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

interface Post {
  id: string
  title: string
  content: string
  excerpt: string
  author: {
    name: string
    avatar: string
  }
  publishDate: string
  readTime: number
  tags: string[]
  image: string
  likes: number
  comments: number
}

const getPostDetails = async (id: string): Promise<Post> => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return {
    id,
    title: "Introducción a React Hooks: Simplificando el Estado y el Ciclo de Vida",
    content: `
      <p>React Hooks ha revolucionado la forma en que escribimos componentes en React, permitiéndonos usar estado y otras características de React sin escribir una clase. En este artículo, exploraremos los hooks más comunes y cómo pueden simplificar nuestro código.</p>
      
      <h2>useState: Manejando el Estado Local</h2>
      <p>useState es probablemente el hook más utilizado. Nos permite añadir estado local a componentes de función. Veamos un ejemplo simple:</p>
      <pre><code class="language-jsx">
      const [count, setCount] = useState(0);
      
      return (
        &lt;div&gt;
          &lt;p&gt;Has hecho clic {count} veces&lt;/p&gt;
          &lt;button onClick={() =&gt; setCount(count + 1)}&gt;
            Haz clic aquí
          &lt;/button&gt;
        &lt;/div&gt;
      );
      </code></pre>
      
      <h2>useEffect: Manejando Efectos Secundarios</h2>
      <p>useEffect nos permite realizar efectos secundarios en componentes funcionales. Es como componentDidMount, componentDidUpdate, y componentWillUnmount combinados.</p>
      <pre><code class="language-jsx">
      useEffect(() => {
        document.title = \`Has hecho clic \${count} veces\`;
      }, [count]); // Solo se re-ejecuta si count cambia
      </code></pre>
      
      <h2>useContext: Consumiendo el Contexto</h2>
      <p>useContext hace que sea fácil consumir el contexto en componentes funcionales sin necesidad de componentes consumidores anidados.</p>
      
      <h2>Conclusión</h2>
      <p>Los Hooks de React proporcionan una forma más directa de utilizar las características de React. Simplifican nuestros componentes y hacen que el código sea más fácil de entender y mantener.</p>
    `,
    excerpt:
      "Descubre cómo React Hooks puede simplificar tu código y mejorar la gestión del estado en tus componentes de React.",
    author: {
      name: "María González",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    publishDate: "2023-07-15T10:00:00Z",
    readTime: 8,
    tags: ["React", "JavaScript", "Hooks", "Frontend"],
    image: "/placeholder-post-image.jpeg",
    likes: 127,
    comments: 23,
  }
}

const mockComments = [
  {
    id: "1",
    author: { name: "Juan Pérez", avatar: "/placeholder.svg?height=40&width=40" },
    content: "¡Excelente artículo! Me ha ayudado mucho a entender los Hooks.",
    likes: 5,
    replies: [
      {
        id: "1-1",
        author: { name: "María González", avatar: "/placeholder.svg?height=40&width=40" },
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
    author: { name: "Ana Rodríguez", avatar: "/placeholder.svg?height=40&width=40" },
    content: "¿Podrías hacer un artículo sobre useCallback y useMemo?",
    likes: 3,
    replies: [],
    createdAt: "2023-07-17T10:00:00Z",
  },
]

export default function PostPage() {
  const { id } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof id === "string") {
      getPostDetails(id).then((postData) => {
        setPost(postData)
        setIsLoading(false)
      })
    }
  }, [id])

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
      <div>
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

  if (!post) return <div>Post no encontrado</div>

  return (
    <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="relative w-full aspect-video mb-8">
        <Image
          src={post.image || "/placeholder.svg"}
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

