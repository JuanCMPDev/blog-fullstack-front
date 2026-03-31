"use client"

import { useState, useEffect, useRef, memo } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
// OG meta tags handled server-side via generateMetadata
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
import { buildApiUrl } from "@/lib/api"
import { createLogger } from "@/lib/logger"
import { getAvatarUrl } from "@/lib/utils"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { StructuredData } from "@/components/blog/StructuredData"
import { ContentResolver } from "@/components/blog/ContentResolver"
import { SeriesNavigationBar } from "@/components/blog/SeriesNavigation"
import { markPostCompleted } from "@/hooks/use-course-progress"
import { extractMarkdownFromHtml } from "@/lib/legacy-post-content"

const logger = createLogger("PostPage")
const ENABLE_LEGACY_BASE64_FALLBACK = process.env.NEXT_PUBLIC_ENABLE_LEGACY_BASE64_FALLBACK === 'true'

// Componente dedicado para renderizar Markdown con SyntaxHighlighter para código
const MarkdownRenderer = memo(({ content }: { content: string }) => {
  void content
  
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none mb-8 text-justify">
      <style jsx global>{`
        .prose h1 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
        }
        .prose h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 1.25rem;
          margin-bottom: 0.75rem;
        }
        .prose h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .prose strong {
          font-weight: 700;
        }
        .prose em {
          font-style: italic;
        }
        .prose ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-top: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .prose ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-top: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .prose li {
          margin-top: 0.25rem;
          margin-bottom: 0.25rem;
        }
        .prose a {
          color: hsl(var(--primary));
          text-decoration: none;
        }
        .prose a:hover {
          text-decoration: underline;
        }
        .prose blockquote {
          border-left: 4px solid hsl(var(--secondary));
          padding-left: 1rem;
          font-style: italic;
          margin: 1rem 0;
        }
        .prose p {
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .prose code {
          background-color: hsl(var(--secondary) / 0.2);
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 0.9em;
        }
        .prose img {
          max-width: 100%;
          height: auto;
          margin: 1rem auto;
          border-radius: 0.5rem;
          display: block;
        }
      `}</style>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Configurar el renderizado de bloques de código
          code: (props) => {
            const {className, children, ...rest} = props;
            const match = /language-(\w+)/.exec(className || '');
            
            if (match && className) {
              return (
                <SyntaxHighlighter
                  language={match[1]}
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
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              );
            }
            
            return (
              <code className={className} {...rest}>
                {children}
              </code>
            );
          },
          // Personalizar estilos de cabeceras
          h1: (props) => <h1 className="text-3xl font-bold my-4" {...props} />,
          h2: (props) => <h2 className="text-2xl font-bold my-3" {...props} />,
          h3: (props) => <h3 className="text-xl font-bold my-2" {...props} />,
          // Personalizar listas
          ul: (props) => <ul className="list-disc pl-6 my-3" {...props} />,
          ol: (props) => <ol className="list-decimal pl-6 my-3" {...props} />,
          // Personalizar párrafos — usar <div> para evitar hydration errors
          // cuando el contenido incluye elementos block (img→div, pre, etc.)
          p: (props) => <div className="my-2" {...props} />,
          // Estilizar enlaces
          a: (props) => <a className="text-primary hover:underline" {...props} />,
          // Manejo personalizado de imágenes con mejor soporte para base64
          img: (props) => {
            // Verificar si el src está vacío o es null
            if (!props.src || props.src.trim() === '') {
              logger.warn('Se intentó renderizar una imagen con src vacío')
              return null; // No renderizar imágenes con src vacío
            }
            
            return (
              <div className="my-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={props.src} 
                  alt={props.alt || 'Imagen'} 
                  className="rounded-lg max-w-full mx-auto markdown-image"
                  style={{ 
                    maxHeight: '60vh',
                    border: props.src.startsWith('data:image') ? '2px solid #3b82f6' : 'none'
                  }}
                  loading="lazy"
                  onError={(e) => {
                    logger.error('Error al cargar la imagen', e)
                    // Si hay error, añadir un marcador de error pero mantener el espacio
                    e.currentTarget.style.display = 'none';
                    const errorDiv = document.createElement('div');
                    errorDiv.textContent = 'Error al cargar la imagen';
                    errorDiv.className = 'text-red-500 text-center p-4 border border-red-300 rounded-lg';
                    e.currentTarget.parentNode?.appendChild(errorDiv);
                  }}
                />
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

MarkdownRenderer.displayName = 'MarkdownRenderer';

export function PostPageClient() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const commentsRef = useRef<HTMLDivElement>(null)
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  // Esperar a que zustand rehidrate el auth state desde localStorage
  const isAuthReady = useAuth((s) => s.accessToken !== undefined)

  useEffect(() => {
    // No hacer fetch hasta que el auth state esté hidratado
    if (!isAuthReady) return

    const fetchPost = async () => {
      setIsLoading(true)
      try {
        const slugValue = Array.isArray(slug) ? slug[0] : slug
        const endpoint = buildApiUrl(`posts/slug/${slugValue}`)

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
        const userRole = user?.role?.toUpperCase()
        if (postData.status !== "PUBLISHED" &&
            (!user || (userRole !== 'ADMIN' && userRole !== 'EDITOR'))) {
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
        logger.error('Error al obtener el post', error)
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
  }, [slug, router, toast, user, isAuthReady])

  // Auto-mark post as completed if it belongs to a course
  useEffect(() => {
    if (post && post.courseId && user) {
      markPostCompleted(post.id)
    }
  }, [post?.id, post?.courseId, user])

  const renderContent = (content: string) => {
    if (!content) return null;
    
    // Forzar renderizado como Markdown para posts específicos
    if (slug === "seguridad-informatica-una-necesidad-imperante-en-la-era-digital" || 
        slug === "seguridad-informatica" ||
        /seguridad-informatica/i.test(String(slug))) {
      
      // Si el contenido tiene etiquetas HTML, extraemos el contenido Markdown
      const extractedContent = extractMarkdownFromHtml(content, {
        includeBase64Fallback: ENABLE_LEGACY_BASE64_FALLBACK,
      });
      return <MarkdownRenderer content={extractedContent} />;
    }
    
    // Verificar si el contenido es Markdown puro o HTML con Markdown dentro
    const isMarkdownContent = () => {
      // Patrones comunes de Markdown
      const markdownPatterns = [
        /\*\*.*\*\*/,          // Negrita
        /\*[^*]+\*/,           // Cursiva
        /^#+ .*$/m,            // Encabezados
        /^- .*$/m,             // Listas con guión
        /^\d+\. .*$/m,         // Listas numeradas
        /^```[\s\S]*?```$/m,   // Bloques de código
        /\[.*?\]\(.*?\)/       // Enlaces
      ];
      
      // Si encontramos patrones de Markdown y NO hay muchas etiquetas HTML complejas
      const hasMarkdownPatterns = markdownPatterns.some(pattern => pattern.test(content));
      const hasMostlyHtml = /<(div|span|table|img|a)\b[^>]*>/.test(content);
      
      return hasMarkdownPatterns && !hasMostlyHtml;
    };
    
    // Si el contenido está mezclado (HTML con Markdown), extraer y renderizar
    if (content.includes('<p>**') || content.includes('<p>#') || 
        (content.includes('<p>') && isMarkdownContent())) {
      
      // Extraer Markdown de HTML
      const extractedContent = extractMarkdownFromHtml(content, {
        includeBase64Fallback: ENABLE_LEGACY_BASE64_FALLBACK,
      });
      return <MarkdownRenderer content={extractedContent} />;
    }
    
    // Si es Markdown, usar el componente especializado
    if (isMarkdownContent()) {
      return <MarkdownRenderer content={content} />;
    }
    
    // Si no es Markdown, continuar con el procesamiento de HTML
    
    // Procesar contenido de ReactQuill (HTML)
    const processCodeBlocks = () => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      
      // Encuentra y agrega estilos para centrar imágenes
      const images = tempDiv.querySelectorAll('img');
      images.forEach(img => {
        // Añadir clases para centrado horizontal
        img.classList.add('mx-auto', 'block');
        
        // Crear un contenedor div si la imagen no está ya dentro de un div
        if (img.parentElement?.tagName !== 'DIV') {
          const wrapper = document.createElement('div');
          wrapper.className = 'text-center my-4';
          img.parentNode?.insertBefore(wrapper, img);
          wrapper.appendChild(img);
        } else if (img.parentElement) {
          // Si ya está en un div, añadir clase de centrado al div padre
          img.parentElement.classList.add('text-center', 'my-4');
        }
      });
      
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
      <div className="prose prose-lg dark:prose-invert max-w-none mb-8 text-justify">
        <style jsx global>{`
          /* Estilos globales para imágenes en contenido HTML */
          .prose img {
            max-width: 100%;
            height: auto;
            margin: 1rem auto;
            border-radius: 0.5rem;
            display: block;
          }
          .prose .text-center {
            text-align: center;
            width: 100%;
          }
          /* Añadir bordes a imágenes base64 para que coincidan con el estilo Markdown */
          .prose img[src^="data:image"] {
            border: 2px solid #3b82f6;
          }
        `}</style>
        {renderedParts}
      </div>
    );
  };

  const scrollToComments = () => {
    if (commentsRef.current) {
      commentsRef.current.scrollIntoView({ behavior: "smooth" })
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
          logger.error("Error al formatear la fecha de publicación", error)
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
    <>
      {/* OG meta tags se manejan server-side via generateMetadata en page.tsx */}
      
      {/* Datos estructurados para SEO */}
      {post && (
        <StructuredData 
          post={post} 
          url={process.env.NEXT_PUBLIC_SITE_URL || 'https://technoespacio.com'} 
        />
      )}
      
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
            {user && (user.role?.toUpperCase() === 'ADMIN' || user.role?.toUpperCase() === 'EDITOR') ? getStatusBanner() : null}
            
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
            <SeriesNavigationBar postId={post.id} />
            <ContentResolver
              content={post.content}
              contentV2={post.contentV2}
              renderLegacy={renderContent}
            />
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
                <ShareMenu url={`https://technoespacio.com/post/${post.slug}`} title={post.title} />
                <SaveButton postId={post.id} size="sm" />
                {user && user.role?.toUpperCase() === 'ADMIN' && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs sm:text-sm px-2 sm:px-3"
                    onClick={() => router.push(`/admin/posts/edit/${post.id}`)}
                    title="Editar este post"
                  >
                    <Settings className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Administrar</span>
                  </Button>
                )}
              </div>
            </div>
            <div ref={commentsRef}>
              <CommentsSection postId={post.id} />
            </div>
          </motion.article>
        ) : null}
      </div>
    </>
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
