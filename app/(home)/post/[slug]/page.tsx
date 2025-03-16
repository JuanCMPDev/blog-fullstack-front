"use client"

import { useState, useEffect, useRef, memo } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { MessageCircle, Calendar, Clock, Settings, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Comments } from "@/components/blog/Comments"
import { useAuth } from "@/lib/auth"
import { Tag } from "@/components/common/Tag"
import { ShareMenu } from "@/components/blog/ShareMenu"
import { LikeButton } from "@/components/blog/LikeButton"
import { SaveButton } from "@/components/blog/SaveButton"
import type { Post, Comment } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { customFetch } from "@/lib/customFetch"
import { getAvatarUrl } from "@/lib/utils"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { motion } from "framer-motion"

export default function PostPage() {
  const { slug } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { isAdmin, isEditor } = useAuth()
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
        
        // Verificar si el post no está publicado y el usuario no tiene permisos
        if (postData.status !== "PUBLISHED" && !isAdmin() && !isEditor()) {
          toast({
            title: "Acceso restringido",
            description: "Este post no está disponible públicamente",
            variant: "destructive",
          })
          router.push("/")
          return
        }
        
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
  }, [slug, router, toast, isAdmin, isEditor])

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
    if (commentSectionRef.current) {
      commentSectionRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Función para mostrar el banner según el estado del post
  const getStatusBanner = () => {
    if (!post || post.status === "PUBLISHED") {
      return null
    }

    let message = "";
    if (post.status === "DRAFT") {
      message = "Este post está en borrador y solo es visible para administradores y editores";
    } else if (post.status === "SCHEDULED") {
      if (post.publishDate && post.publishDate !== "null") {
        try {
          const formattedDate = format(new Date(post.publishDate), "d 'de' MMMM 'de' yyyy", { locale: es });
          message = `Este post está programado para publicarse el ${formattedDate}`;
        } catch (error) {
          console.error("Error al formatear la fecha de publicación:", error);
          message = "Este post está programado para publicarse en una fecha futura";
        }
      } else {
        message = "Este post está programado para publicarse en una fecha futura";
      }
    } else {
      message = "Este post no está publicado";
    }

    return (
      <Alert className="mb-6 border-amber-500 bg-amber-50 dark:bg-amber-900/20">
        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        <AlertTitle className="text-amber-600 dark:text-amber-400 font-medium">
          {post.status === "DRAFT" ? "Borrador" : "Programado"}
        </AlertTitle>
        <AlertDescription className="text-amber-600 dark:text-amber-400">
          {message}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container max-w-4xl px-4 py-8 mx-auto">
      {isLoading ? (
        <div className="space-y-8">
          <div className="w-2/3">
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-[400px] w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      ) : post ? (
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Status Banner para posts no publicados */}
          {isAdmin() || isEditor() ? getStatusBanner() : null}
          
          <div className="relative w-full aspect-video mb-8">
            <Image
              src={post.coverImage || "/placeholder.svg"}
              alt={post.title}
              fill
              className="object-cover rounded-lg shadow-lg"
              priority
            />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Avatar className="mr-2 h-8 w-8">
                <AvatarImage
                  src={getAvatarUrl(post.author?.avatar)}
                  alt={post.author?.name}
                />
                <AvatarFallback>
                  {post.author?.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <span className="font-medium text-foreground">
                  {post.author?.name}
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              {(() => {
                try {
                  // Usar publishDate para posts publicados, o createdAt como alternativa
                  const dateToUse = post.publishDate || post.createdAt;
                  if (dateToUse && dateToUse !== 'null') {
                    return format(
                      new Date(dateToUse),
                      "d 'de' MMMM 'de' yyyy",
                      { locale: es }
                    );
                  }
                  return 'Fecha no disponible';
                } catch (error) {
                  console.error("Error al formatear la fecha del post:", error);
                  return 'Fecha no disponible';
                }
              })()}
            </div>
            <div className="flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              {post.readTime || 0} min de lectura
            </div>
          </div>
          {/* Tags del post */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => (
              <Tag key={index} name={tag} />
            ))}
          </div>
          {renderContent(post.content)}
          <div className="flex items-center justify-between border-t border-b py-4 mb-8 bg-background/90">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <LikeButton 
                postId={post.id} 
                initialLikesCount={post.likes} 
                size="sm"
              />
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3" onClick={scrollToComments}>
                <MessageCircle className="h-4 w-4 mr-1 sm:mr-2" />
                <span>
                  {typeof post.comments === 'number' 
                    ? post.comments 
                    : (post.comments && Array.isArray(post.comments))
                      ? (post.comments as Comment[]).length
                      : 0}
                </span>
              </Button>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <ShareMenu url={`https://yourblog.com/post/${post.id}`} title={post.title} />
              <SaveButton postId={post.id} size="sm" />
              {isAdmin() && (
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                  <Settings className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Administrar</span>
                </Button>
              )}
            </div>
          </div>
          <div ref={commentSectionRef}>
            <CommentsSection postId={post.id} />
          </div>
        </motion.article>
      ) : null}
    </div>
  )
}

// Componente separado para la sección de comentarios
const CommentsSection = memo(({ postId }: { postId: number }) => {
  return (
    <>
      {/* Always show the Comments component regardless of loading state */}
      <Comments comments={[]} postId={postId} />
    </>
  )
})

CommentsSection.displayName = "CommentsSection";
