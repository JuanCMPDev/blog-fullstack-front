import type { Comment, Author } from "@/lib/types"

// Definimos interfaces para los datos que provienen de la API
interface ApiCommentData {
  id?: string;
  content?: string;
  likes?: number;
  createdAt?: string;
  postId?: number;
  parentId?: string;
  author?: {
    id?: string;
    name?: string;
    nick?: string;
    avatar?: string;
  };
  authorId?: string;
  replies?: ApiCommentData[];
  [key: string]: unknown;
}

/**
 * Asegura que cada comentario tenga la estructura correcta
 * Aplica valores por defecto para evitar errores de tipo o renderización
 */
export const ensureCommentStructure = (comment: Partial<Comment> | ApiCommentData): Comment => {
  if (!comment || typeof comment !== 'object') {
    // Si el comentario no es un objeto válido, devolver un objeto con estructura segura
    return {
      id: Math.random().toString(),
      author: {
        id: 'unknown',
        name: 'Usuario desconocido',
        avatar: ''
      },
      content: '',
      likes: 0,
      replies: [],
      createdAt: new Date().toISOString(),
      postId: undefined,
      parentId: undefined
    };
  }
  
  // Asegurar que el autor sea un objeto válido
  let author: Author = {
    id: 'unknown',
    name: 'Usuario',
    avatar: ''
  };
  
  if (comment.author && typeof comment.author === 'object') {
    author = {
      id: comment.author.id || 'unknown',
      name: comment.author.name || (comment.author as ApiCommentData['author'])?.nick || 'Usuario',
      avatar: comment.author.avatar || ''
    };
  } else if (comment.authorId) {
    // Si solo tenemos el authorId pero no el objeto completo
    author = {
      id: comment.authorId,
      name: 'Usuario',
      avatar: ''
    };
  }
  
  // Si tiene respuestas, asegurarnos de procesarlas recursivamente
  let replies: Comment[] = [];
  if (Array.isArray(comment.replies)) {
    replies = comment.replies.map(reply => {
      // Asegurarnos de que la respuesta tenga parentId
      const replyWithParentId = {
        ...reply,
        parentId: reply.parentId || comment.id // Si no tiene parentId, usar el id del comentario actual
      };
      return ensureCommentStructure(replyWithParentId);
    });
  }
  
  // Devolver un comentario con todas las propiedades seguras
  return {
    ...comment,
    id: comment.id || Math.random().toString(),
    author,
    content: typeof comment.content === 'string' ? comment.content : '',
    likes: typeof comment.likes === 'number' ? comment.likes : 0,
    replies,
    createdAt: comment.createdAt || new Date().toISOString(),
    postId: comment.postId || undefined,
    parentId: comment.parentId // Preservar explícitamente el parentId
  } as Comment;
};

// Función para convertir respuestas API a estructura de comentarios
export function convertApiReplyToComment(apiReply: ApiCommentData): Comment {
  return {
    id: apiReply.id || '',
    content: apiReply.content || '',
    likes: apiReply.likes || 0,
    createdAt: apiReply.createdAt || new Date().toISOString(),
    postId: apiReply.postId,
    parentId: apiReply.parentId,
    author: {
      id: apiReply.author?.id || apiReply.authorId || 'unknown',
      name: apiReply.author?.name || 'Usuario',
      avatar: apiReply.author?.avatar || ''
    },
    replies: Array.isArray(apiReply.replies) ? apiReply.replies.map(convertApiReplyToComment) : []
  };
}

// Caché simple para evitar solicitudes duplicadas
const repliesCache = new Map<string, {
  timestamp: number;
  data: Comment[];
}>();

// Duración del caché en milisegundos (2 minutos)
const CACHE_DURATION = 2 * 60 * 1000;

// Función para cargar las respuestas de un comentario específico
export async function loadCommentsReplies(commentId: string): Promise<Comment[]> {
  // Si no hay ID, retornar array vacío inmediatamente
  if (!commentId) {
    return [];
  }
  
  // Verificar si tenemos datos en caché y si son recientes
  const cachedData = repliesCache.get(commentId);
  if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
    console.debug(`Usando respuestas en caché para el comentario ${commentId.slice(0, 6)}...`);
    return cachedData.data;
  }
  
  try {
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    if (apiUrl.endsWith('/')) {
      apiUrl = apiUrl.slice(0, -1);
    }
    
    const endpoint = `${apiUrl}/comments/replies/${commentId}?limit=50`;
    
    // Usar AbortController para poder cancelar la petición si tarda demasiado
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos de timeout
    
    try {
      const response = await fetch(endpoint, {
        signal: controller.signal
      });
      
      // Limpiar el timeout ya que la petición se completó
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Si el comentario no existe (404), devolver un array vacío sin error
        if (response.status === 404) {
          console.debug(`El comentario ${commentId.slice(0, 6)}... ya no existe o no tiene respuestas.`);
          return [];
        }
        // Para otros errores, lanzar una excepción con el código de estado
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.data || !Array.isArray(data.data)) {
        return [];
      }
      
      // Si la respuesta está vacía, retornar array vacío
      if (data.data.length === 0) {
        return [];
      }
      
      // Convertir las respuestas a la estructura correcta
      const processedReplies = data.data.map((reply: ApiCommentData) => {
        return convertApiReplyToComment({
          ...reply,
          parentId: reply.parentId || commentId
        });
      });
      
      // Guardar en caché
      repliesCache.set(commentId, {
        timestamp: Date.now(),
        data: processedReplies
      });
      
      return processedReplies;
    } catch (error) {
      // Si la petición fue abortada por timeout
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.debug('La petición de respuestas fue cancelada por timeout');
        return [];
      }
      
      // Propagar otros errores
      throw error;
    }
  } catch (error) {
    // Manejar el error 404 silenciosamente
    if (error instanceof Error && error.message.includes('404')) {
      return [];
    }
    
    // Para otros errores, registrar y propagar
    console.error('Error al cargar respuestas:', error);
    throw error;
  }
} 