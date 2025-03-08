"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ThumbsUp, MessageCircle, Bookmark, Calendar, Clock, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Comments } from "@/components/blog/Comments"
import { useAuth } from "@/lib/auth"
import { Tag } from "@/components/common/Tag"
import { ShareMenu } from "@/components/blog/ShareMenu"
import type { Post } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { customFetch } from "@/lib/customFetch"
import { getAvatarUrl } from "@/lib/utils"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism"

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
  const { slug } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { isAdmin, user } = useAuth()
  const commentSectionRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true)
      try {
        const slugValue = Array.isArray(slug) ? slug[0] : slug
        
        // Asegurarse de que la URL no tenga barras duplicadas
        let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        // Eliminar la barra final si existe
        if (apiUrl.endsWith('/')) {
          apiUrl = apiUrl.slice(0, -1)
        }
        const endpoint = `${apiUrl}/posts/slug/${slugValue}`
        
        const response = await customFetch(endpoint)
        
        if (!response.ok) {
          if (response.status === 404) {
            router.push("/404")
            return
          }
          throw new Error(`Error al cargar el post: ${response.statusText}`)
        }
        
        const postData = await response.json()
        setPost(postData)
      } catch (error) {
        console.error('Error al obtener el post:', error)
        toast({
          title: "Error",
          description: "No se pudo cargar el post. Intente nuevamente.",
          variant: "destructive",
        })
        router.push("/404")
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) {
      fetchPost()
    }
  }, [slug, router, toast])

  const renderContent = (content: string) => {
    // Detectar y extraer bloques de código de ReactQuill
    const processCodeBlocks = () => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      
      // Encontrar todos los contenedores de bloques de código
      const codeContainers = tempDiv.querySelectorAll('.ql-code-block-container');
      
      codeContainers.forEach(container => {
        // Obtener todos los bloques de código dentro del contenedor
        const codeBlocks = container.querySelectorAll('.ql-code-block');
        if (codeBlocks.length === 0) return;
        
        // Determinar el lenguaje desde el primer bloque (si está disponible)
        let language = 'javascript'; // Valor por defecto
        const firstBlock = codeBlocks[0];
        const langAttr = firstBlock.getAttribute('data-language');
        
        if (langAttr && langAttr !== 'plain') {
          language = langAttr;
        } else {
          // Intenta detectar lenguajes comunes desde la primera línea
          const firstLine = firstBlock.textContent || '';
          if (firstLine.includes('function') || firstLine.includes('const') || firstLine.includes('let')) {
            language = 'javascript';
          } else if (firstLine.includes('class') || firstLine.includes('import')) {
            language = 'typescript';
          } else if (firstLine.includes('<div') || firstLine.includes('<span')) {
            language = 'html';
          } else if (firstLine.includes('.class') || firstLine.includes('#id')) {
            language = 'css';
          }
        }
        
        // Extraer y combinar todo el código de los bloques
        let combinedCode = '';
        codeBlocks.forEach(block => {
          combinedCode += block.textContent + '\n';
        });
        
        // Crear un nuevo elemento para el resaltador de sintaxis
        const syntaxDiv = document.createElement('div');
        syntaxDiv.className = 'syntax-highlighter-wrapper';
        syntaxDiv.setAttribute('data-language', language);
        syntaxDiv.textContent = combinedCode;
        
        // Reemplazar el contenedor original con nuestro nuevo div
        container.parentNode?.replaceChild(syntaxDiv, container);
      });
      
      return tempDiv.innerHTML;
    };
    
    // Extraer áreas de código para renderizarlas por separado
    const processedHtml = processCodeBlocks();
    
    // Dividir el HTML para procesar las partes con y sin resaltado de sintaxis
    const parts = processedHtml.split(/<div class="syntax-highlighter-wrapper" data-language="([^"]+)">([\s\S]*?)<\/div>/g);
    
    // Renderizar el contenido HTML con los bloques de código procesados
    const renderedParts = [];
    for (let i = 0; i < parts.length; i++) {
      if (i % 3 === 0) {
        // Contenido HTML normal
        if (parts[i]) {
          renderedParts.push(
            <div key={`html-${i}`} dangerouslySetInnerHTML={{ __html: parts[i] }} />
          );
        }
      } else if (i % 3 === 1) {
        // Lenguaje de programación
        const language = parts[i];
        const code = parts[i + 1] || '';
        
        renderedParts.push(
          <SyntaxHighlighter
            key={`code-${i}`}
            language={language}
            style={tomorrow}
            showLineNumbers
            wrapLines
            customStyle={{
              margin: '1em 0',
              borderRadius: '0.5rem',
              fontSize: '0.9rem',
              lineHeight: '1.5',
            }}
          >
            {code}
          </SyntaxHighlighter>
        );
        
        // Saltarse el siguiente elemento (que ya procesamos)
        i++;
      }
    }
    
    return (
      <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
        {renderedParts}
      </div>
    );
  };

  const scrollToComments = () => {
    if (!user) {
      toast({
        title: "Inicio de sesión requerido",
        description: "Debes iniciar sesión para comentar.",
        variant: "destructive",
      })
      return
    }
    commentSectionRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleLike = () => {
    if (!user) {
      toast({
        title: "Inicio de sesión requerido",
        description: "Debes iniciar sesión para dar like.",
        variant: "destructive",
      })
      return
    }
    // Aquí iría la lógica para dar like al post
    console.log("Like dado al post")
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
    <div className="container mx-auto px-4 py-8">
      <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
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
            <AvatarImage src={getAvatarUrl(post.author.avatar)} alt={post.author.name} />
            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{post.author.name}</p>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4" />
              <span>{format(new Date(post.publishDate as string), "dd MMMM, yyyy", { locale: es })}</span>
              <span className="mx-2">•</span>
              <Clock className="mr-2 h-4 w-4" />
              <span>{post.readTime} min de lectura</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {post.tags.map((tag, index) => (
            <Tag key={index} name={tag} />
          ))}
        </div>
        {renderContent(post.content)}
        <div className="flex items-center justify-between border-t border-b py-4 mb-8 bg-background/90">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3" onClick={handleLike}>
              <ThumbsUp className="h-4 w-4 mr-1 sm:mr-2" />
              <span>{post.likes}</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3" onClick={scrollToComments}>
              <MessageCircle className="h-4 w-4 mr-1 sm:mr-2" />
              <span>{post.comments}</span>
            </Button>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <ShareMenu url={`https://yourblog.com/post/${post.id}`} title={post.title} />
            <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
              <Bookmark className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Guardar</span>
            </Button>
            {isAdmin() && (
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                <Settings className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Administrar</span>
              </Button>
            )}
          </div>
        </div>
        <div ref={commentSectionRef}>
          <Comments comments={mockComments} />
        </div>
      </motion.article>
    </div>
  )
}

