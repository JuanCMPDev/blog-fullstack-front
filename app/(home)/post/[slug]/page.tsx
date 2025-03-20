"use client"

import { useState, useEffect, useRef, memo } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import Head from "next/head"
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
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { StructuredData } from "@/components/blog/StructuredData"

// Componente dedicado para renderizar Markdown con SyntaxHighlighter para código
const MarkdownRenderer = memo(({ content }: { content: string }) => {
  console.log('MarkdownRenderer recibió:', content.substring(0, 100) + "...");
  
  // Verificar si el contenido incluye imágenes en base64
  const hasBase64 = content.includes('data:image');
  if (hasBase64) {
    console.log('El contenido contiene imágenes en base64');
  }
  
  useEffect(() => {
    // Este efecto se ejecuta en el cliente después de renderizar
    // Ayuda a verificar qué imágenes se están procesando
    const images = document.querySelectorAll('.markdown-image');
    console.log(`Se encontraron ${images.length} imágenes en el DOM después del renderizado`);
    
    // Verificar si hay imágenes en base64
    images.forEach((img, index) => {
      const src = (img as HTMLImageElement).src;
      if (src.startsWith('data:image')) {
        console.log(`Imagen ${index} es base64`);
      }
    });
  }, [content]);
  
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
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
          // Personalizar párrafos
          p: (props) => <p className="my-2" {...props} />,
          // Estilizar enlaces
          a: (props) => <a className="text-primary hover:underline" {...props} />,
          // Manejo personalizado de imágenes con mejor soporte para base64
          img: (props) => {
            console.log('Renderizando imagen, src:', props.src ? (props.src.startsWith('data:image') ? 'Base64 image (truncated)' : props.src) : 'null');
            
            // Verificar si el src está vacío o es null
            if (!props.src || props.src.trim() === '') {
              console.warn('Se intentó renderizar una imagen con src vacío');
              return null; // No renderizar imágenes con src vacío
            }
            
            // Limitar la longitud máxima de las URLs base64 para el log
            const logSrc = props.src.startsWith('data:image') 
              ? `${props.src.substring(0, 30)}...` 
              : props.src;
            
            console.log(`Renderizando imagen con src: ${logSrc}`);
            
            return (
              <div className="my-4">
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
                    console.error('Error al cargar la imagen:', e);
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

// Función para optimizar las imágenes para compartir en redes sociales
const getOptimizedImageUrl = (imageUrl: string, siteUrl: string) => {
  // Si la imagen es relativa, convertirla en absoluta
  if (imageUrl && !imageUrl.startsWith('http')) {
    if (imageUrl.startsWith('/')) {
      imageUrl = `${siteUrl}${imageUrl}`
    } else {
      imageUrl = `${siteUrl}/${imageUrl}`
    }
  }
  
  // Si la imagen ya es servida por un CDN de imágenes (como Cloudinary, Imgix, etc.)
  // podríamos añadir parámetros para optimizarla
  if (imageUrl.includes('cloudinary.com')) {
    // Por ejemplo, para Cloudinary: solicitar una imagen optimizada para redes sociales
    // w_1200,h_630,c_fill,q_auto,f_auto establece ancho, alto, recorte, calidad auto y formato auto
    return imageUrl.replace('/upload/', '/upload/w_1200,h_630,c_fill,q_auto,f_auto/');
  }
  
  // En caso de que se use otro servicio de optimización de imágenes, se podría añadir aquí
  
  return imageUrl;
}

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const commentsRef = useRef<HTMLDivElement>(null)
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  // SEO - Metadatos dinámicos para este post específico
  const [postMetadata, setPostMetadata] = useState({
    title: 'Techno Espacio',
    description: 'Artículo sobre tecnología y programación',
    image: '/og-image.jpg',
    author: 'Techno Espacio',
    publishDate: '',
    modifiedDate: '',
    tags: [] as string[]
  })

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
        if (postData.status !== "PUBLISHED" && 
            (!user || (user && !user.role?.includes('ADMIN') && !user.role?.includes('EDITOR')))) {
          toast({
            title: "Acceso restringido",
            description: "Este post no está disponible públicamente",
            variant: "destructive",
          })
          router.push("/")
          return
        }
        
        setPost(postData)
        
        // URL base del sitio
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://technoespacio.com'
        
        // Obtener URL de imagen optimizada para compartir
        const coverImageUrl = getOptimizedImageUrl(
          postData.coverImage || '/og-image.jpg',
          siteUrl
        );
        
        // Actualizar metadatos para SEO
        setPostMetadata({
          title: `${postData.title} | Techno Espacio`,
          description: postData.excerpt || postData.title,
          image: coverImageUrl,
          author: postData.author?.name || 'Techno Espacio',
          publishDate: postData.createdAt,
          modifiedDate: postData.updatedAt,
          tags: postData.tags?.map((tag: { name: string }) => tag.name) || []
        })
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
  }, [slug, router, toast, user])

  const renderContent = (content: string) => {
    if (!content) return null;
    
    // Forzar renderizado como Markdown para posts específicos
    if (slug === "seguridad-informatica-una-necesidad-imperante-en-la-era-digital" || 
        slug === "seguridad-informatica" ||
        /seguridad-informatica/i.test(String(slug))) {
      console.log('Renderizando contenido Markdown (forzado para post específico de seguridad informática)');
      
      // Si el contenido tiene etiquetas HTML, extraemos el contenido Markdown
      const extractedContent = extractMarkdownFromHtml(content);
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
      console.log('Renderizando contenido mezclado HTML/Markdown');
      
      // Extraer Markdown de HTML
      const extractedContent = extractMarkdownFromHtml(content);
      return <MarkdownRenderer content={extractedContent} />;
    }
    
    // Si es Markdown, usar el componente especializado
    if (isMarkdownContent()) {
      console.log('Renderizando contenido Markdown');
      return <MarkdownRenderer content={content} />;
    }
    
    // Si no es Markdown, continuar con el procesamiento de HTML
    console.log('Renderizando contenido HTML');
    
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
      <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
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

  // Función para extraer imágenes del HTML usando regex
  function extractImages(htmlContent: string): { imagesMarkdown: string, positionMap: Record<string, string> } {
    const images: { marker: string, markdown: string }[] = [];
    const positionMap: Record<string, string> = {};
    let counter = 0;
    
    // Buscar imágenes con atributo alt
    const imgRegexWithAlt = /<img[^>]+src="([^"]+)"[^>]*alt="([^"]+)"[^>]*>/g;
    let imgMatch;
    while ((imgMatch = imgRegexWithAlt.exec(htmlContent)) !== null) {
      const src = imgMatch[1];
      const alt = imgMatch[2];
      
      if (!src || src.trim() === '') {
        console.log('Imagen encontrada con src vacío');
        continue;
      }
      
      const isBase64 = src.startsWith('data:image');
      console.log(`Procesando imagen ${counter}: ${isBase64 ? 'base64' : src}`);
      
      const marker = `__IMG_MARKER_${counter}__`;
      const markdownImg = `![${alt}](${src})`;
      
      images.push({ marker, markdown: markdownImg });
      positionMap[imgMatch[0]] = marker;
      counter++;
    }
    
    // Buscar imágenes sin atributo alt
    const imgRegexWithoutAlt = /<img[^>]+src="([^"]+)"[^>]*(?!alt=)[^>]*>/g;
    while ((imgMatch = imgRegexWithoutAlt.exec(htmlContent)) !== null) {
      const src = imgMatch[1];
      
      if (!src || src.trim() === '') {
        console.log('Imagen encontrada con src vacío');
        continue;
      }
      
      // Verificar que no hayamos procesado ya esta img (para evitar duplicados)
      if (Object.keys(positionMap).includes(imgMatch[0])) {
        continue;
      }
      
      const isBase64 = src.startsWith('data:image');
      console.log(`Procesando imagen ${counter}: ${isBase64 ? 'base64' : src}`);
      
      const marker = `__IMG_MARKER_${counter}__`;
      const markdownImg = `![Imagen](${src})`;
      
      images.push({ marker, markdown: markdownImg });
      positionMap[imgMatch[0]] = marker;
      counter++;
    }
    
    // Buscar específicamente la imagen base64 que sabemos que existe
    const specificBase64Start = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA';
    if (htmlContent.includes(specificBase64Start) && images.length === 0) {
      console.log('Encontrada la imagen base64 específica usando búsqueda directa');
      
      // Obtener la URL base64 completa
      const base64StartIndex = htmlContent.indexOf(specificBase64Start);
      // Buscar el cierre de comillas después del inicio del base64
      let endIndex = htmlContent.indexOf('"', base64StartIndex);
      if (endIndex === -1) {
        // Si no hay comillas, buscar el cierre de comilla simple
        endIndex = htmlContent.indexOf("'", base64StartIndex);
      }
      
      if (endIndex !== -1) {
        const base64Url = htmlContent.substring(base64StartIndex, endIndex);
        const marker = `__IMG_MARKER_${counter}__`;
        const markdownImg = `![Imagen Base64](${base64Url})`;
        
        images.push({ marker, markdown: markdownImg });
        // Crear un marcador para esta imagen
        const fakeTag = `<img src="${base64Url}" alt="Base64 Image">`;
        positionMap[fakeTag] = marker;
        
        // Reemplazar la URL base64 real con el marcador en el HTML
        htmlContent = htmlContent.replace(base64Url, marker);
        counter++;
      }
    }
    
    // Crear cadena de texto con todas las imágenes en formato Markdown
    const imagesMarkdown = images.map(img => img.markdown).join('\n\n');
    
    console.log(`Se encontraron ${images.length} imágenes`);
    return { imagesMarkdown, positionMap };
  }

  // Función para extraer texto limpio del HTML
  function extractText(htmlContent: string, positionMap: Record<string, string>): string {
    let content = htmlContent;
    
    // Reemplazar las etiquetas de imagen con sus marcadores
    Object.entries(positionMap).forEach(([imgTag, marker]) => {
      content = content.replace(imgTag, marker);
    });
    
    // Convertir párrafos HTML en líneas de texto (usando gi en lugar de gs)
    content = content.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n');
    
    // Convertir encabezados HTML en formato Markdown (usando gi en lugar de gs)
    content = content.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n\n');
    content = content.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n\n');
    content = content.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n\n');
    content = content.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '#### $1\n\n');
    
    // Convertir listas HTML en formato Markdown (usando gi en lugar de gs)
    content = content.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, '$1\n\n');
    content = content.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, '$1\n\n');
    content = content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '* $1\n');
    
    // Convertir formato de texto (usando gi en lugar de gs)
    content = content.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**');
    content = content.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**');
    content = content.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*');
    content = content.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*');
    
    // Convertir enlaces HTML en formato Markdown (usando gi en lugar de gs)
    content = content.replace(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
    
    // Eliminar todas las demás etiquetas HTML
    content = content.replace(/<[^>]+>/g, '');
    
    // Decodificar entidades HTML
    content = content.replace(/&nbsp;/g, ' ');
    content = content.replace(/&amp;/g, '&');
    content = content.replace(/&lt;/g, '<');
    content = content.replace(/&gt;/g, '>');
    content = content.replace(/&quot;/g, '"');
    content = content.replace(/&#39;/g, "'");
    
    // Buscar marcadores de posición y restaurar el orden original
    Object.values(positionMap).forEach(marker => {
      if (content.includes(marker)) {
        // El marcador ya está en el contenido, lo dejamos ahí
      } else {
        // Si el marcador no está en el contenido, lo agregamos al final
        content += `\n\n${marker}`;
      }
    });
    
    // Eliminar líneas vacías múltiples
    content = content.replace(/\n{3,}/g, '\n\n');
    
    return content;
  }

  function extractMarkdownFromHtml(htmlContent: string): string {
    console.log('Extrayendo Markdown de HTML, longitud del contenido:', htmlContent.length);
    
    // Extraer imágenes y obtener sus marcadores de posición
    const { imagesMarkdown, positionMap } = extractImages(htmlContent);
    
    // Extraer texto limpio y reemplazar marcadores con el contenido real
    let textContent = extractText(htmlContent, positionMap);
    
    // Reemplazar los marcadores con las imágenes en formato Markdown
    Object.values(positionMap).forEach((marker, index) => {
      const imageMarkdown = imagesMarkdown.split('\n\n')[index];
      if (imageMarkdown) {
        textContent = textContent.replace(marker, imageMarkdown);
      }
    });
    
    // Verificar si hay una imagen base64 específica que sabemos que existe
    const specificBase64Start = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA';
    if (htmlContent.includes(specificBase64Start) && !textContent.includes(specificBase64Start)) {
      console.log('La imagen base64 específica no se incluyó correctamente, añadiéndola manualmente');
      
      // Obtener la URL base64 completa
      const base64StartIndex = htmlContent.indexOf(specificBase64Start);
      // Buscar el cierre de comillas después del inicio del base64
      let endIndex = htmlContent.indexOf('"', base64StartIndex);
      if (endIndex === -1) {
        // Si no hay comillas, buscar el cierre de comilla simple
        endIndex = htmlContent.indexOf("'", base64StartIndex);
      }
      
      if (endIndex !== -1) {
        const base64Url = htmlContent.substring(base64StartIndex, endIndex);
        // Añadir la imagen base64 al final del contenido
        textContent += `\n\n![Imagen Base64](${base64Url})`;
      }
    }
    
    console.log('Markdown generado, longitud:', textContent.length);
    return textContent;
  }

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
    <>
      <Head>
        {/* Metadatos básicos */}
        <title>{postMetadata.title}</title>
        <meta name="description" content={postMetadata.description} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={postMetadata.title} />
        <meta property="og:description" content={postMetadata.description} />
        <meta property="og:image" content={postMetadata.image} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://technoespacio.com'}/post/${slug}`} />
        <meta property="og:site_name" content="Techno Espacio" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={postMetadata.title} />
        <meta name="twitter:description" content={postMetadata.description} />
        <meta name="twitter:image" content={postMetadata.image} />
        <meta name="twitter:site" content="@technoespacio" />
        <meta name="twitter:creator" content="@technoespacio" />
        
        {/* Pinterest */}
        <meta name="pinterest:description" content={postMetadata.description} />
        <meta name="pinterest:image" content={postMetadata.image} />
        
        {/* WhatsApp / Telegram mejorado */}
        <meta property="og:image:alt" content={`Imagen de portada para ${postMetadata.title}`} />
        
        {/* Artículo específico */}
        {postMetadata.publishDate && (
          <meta property="article:published_time" content={postMetadata.publishDate} />
        )}
        {postMetadata.modifiedDate && (
          <meta property="article:modified_time" content={postMetadata.modifiedDate} />
        )}
        {postMetadata.tags.map((tag, index) => (
          <meta key={index} property="article:tag" content={tag} />
        ))}
      </Head>
      
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
            {user && user.role?.includes('ADMIN') || user?.role?.includes('EDITOR') ? getStatusBanner() : null}
            
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
                <ShareMenu url={`https://technoespacio.com/post/${post.slug}`} title={post.title} />
                <SaveButton postId={post.id} size="sm" />
                {user && user.role?.includes('ADMIN') && (
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
