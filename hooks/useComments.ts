import { useState, useEffect, useCallback } from "react"
import type { Comment, UseCommentsReturn } from "@/lib/types"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { customFetch } from "@/lib/customFetch"

// Interfaz para datos de comentarios de la API
interface ApiCommentData {
  id: string;
  content?: string;
  author?: {
    id?: string;
    name?: string;
    avatar?: string;
  };
  authorId?: string;
  likes?: number;
  replies?: ApiCommentData[];
  createdAt?: string;
  postId?: number;
  parentId?: string;
  [key: string]: unknown;
}

interface UseCommentsProps {
  postId: number | null;
  initialComments?: Comment[];
}

export const useComments = ({ postId, initialComments = [] }: UseCommentsProps): UseCommentsReturn => {
  // Asegurar que initialComments sea siempre un array
  const safeInitialComments = Array.isArray(initialComments) ? initialComments : [];
  
  // Función para asegurar que cada comentario tenga la estructura correcta
  const ensureCommentStructure = (comment: Comment): Comment => {
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
        postId: undefined
      };
    }
  
    // Asegurar que el autor sea un objeto válido
    const author = comment.author && typeof comment.author === 'object' 
      ? {
          id: comment.author.id || 'unknown',
          name: comment.author.name || 'Usuario',
          avatar: comment.author.avatar || ''
        }
      : {
          id: 'unknown',
          name: 'Usuario',
          avatar: ''
        };
  
    // Devolver un comentario con todas las propiedades seguras
    return {
      ...comment,
      id: comment.id || Math.random().toString(),
      author,
      content: typeof comment.content === 'string' ? comment.content : '',
      likes: typeof comment.likes === 'number' ? comment.likes : 0,
      replies: Array.isArray(comment.replies) 
        ? comment.replies.map(ensureCommentStructure) 
        : [],
      createdAt: comment.createdAt || new Date().toISOString(),
      postId: comment.postId || undefined
    };
  };
  
  // Asegurar que los comentarios iniciales tengan la estructura correcta
  const structuredInitialComments = safeInitialComments.map(ensureCommentStructure);
  
  const [comments, setComments] = useState<Comment[]>(structuredInitialComments)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  // Función para obtener la URL base de la API
  const getBaseApiUrl = useCallback(() => {
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    // Eliminar la barra final si existe
    if (apiUrl.endsWith('/')) {
      apiUrl = apiUrl.slice(0, -1);
    }
    return apiUrl;
  }, []);

  // Añadir estados para paginación y orden
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [order, setOrder] = useState<string>('likes_desc');
  const [hasMore, setHasMore] = useState(false);
  const [meta, setMeta] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Añadir un estado para controlar si ya se ha hecho la petición inicial
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  // Cargar comentarios del post
  const fetchComments = useCallback(async (pageNum = 1, resetList = false, orderValue?: string) => {
    if (!postId) {
      // Si no hay postId, simplemente establecer un array vacío y terminar el estado de carga
      setComments([]);
      setIsLoading(false);
      return;
    }
    
    // Evitar iniciar una nueva carga si ya está en proceso
    if (isLoading && pageNum === page) return;
    
    setIsLoading(true);
    
    try {
      const apiUrl = getBaseApiUrl();
      
      // Usar el valor de orden pasado directamente o el del estado
      const currentOrder = orderValue || order;
      
      // El backend espera directamente los valores: newest, oldest, likes_desc, likes_asc
      // No necesitamos hacer conversión, usamos el valor directamente
      console.log(`[DEBUG] Ejecutando fetchComments con orden: ${currentOrder}`);
      
      // Usar el nuevo endpoint que ya devuelve la estructura completa de comentarios anidados
      const endpoint = `${apiUrl}/comments/post/${postId}/nested?page=${pageNum}&limit=${limit}&order=${currentOrder}`;
      console.log(`[DEBUG] Cargando comentarios desde: ${endpoint}`);
      
      const response = await customFetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`Error al cargar comentarios: ${response.statusText}`);
      }
      
      const responseJson = await response.json();
      
      // Extraer datos y metadatos
      const commentsData = responseJson.data || [];
      const metaData = responseJson.meta || {
        currentPage: pageNum,
        totalPages: 1,
        totalItems: commentsData.length,
        itemsPerPage: limit
      };
      
      // Si no hay comentarios, establecer array vacío y terminar
      if (commentsData.length === 0) {
        console.log('[DEBUG] No se encontraron comentarios en la respuesta');
        if (resetList) {
          setComments([]);
        }
        setMeta(metaData);
        setHasMore(false);
        setPage(metaData.currentPage);
        setIsLoading(false);
        return;
      }
      
      console.log(`[DEBUG] Se encontraron ${commentsData.length} comentarios principales con sus respuestas anidadas`);
      
      // Asegurar que cada comentario tenga la estructura correcta (recursivamente)
      const ensureNestedStructure = (comment: ApiCommentData): Comment => {
        // Crear una estructura base para el comentario
        const baseComment: Comment = {
          id: comment.id,
          content: comment.content || '',
          likes: comment.likes || 0,
          replies: [],
          createdAt: comment.createdAt || new Date().toISOString(),
          postId: comment.postId || undefined,
          parentId: comment.parentId,
          author: comment.author 
            ? {
                id: comment.author.id || 'unknown',
                name: comment.author.name || 'Usuario',
                avatar: comment.author.avatar || ''
              }
            : {
                id: comment.authorId || 'unknown',
                name: 'Usuario',
                avatar: ''
              }
        };
        
        // Procesar recursivamente las respuestas si existen
        if (comment.replies && Array.isArray(comment.replies) && comment.replies.length > 0) {
          baseComment.replies = comment.replies.map(ensureNestedStructure);
        }
        
        return baseComment;
      };
      
      // Procesar cada comentario principal y sus respuestas
      const structuredComments = commentsData.map(ensureNestedStructure);
      
      // Contar el número total de respuestas cargadas para depuración
      let totalRepliesCount = 0;
      const countReplies = (commentsList: Comment[]) => {
        commentsList.forEach(comment => {
          if (comment.replies && comment.replies.length > 0) {
            totalRepliesCount += comment.replies.length;
            countReplies(comment.replies);
          }
        });
      };
      
      countReplies(structuredComments);
      console.log(`[DEBUG] Total de respuestas cargadas en todos los niveles: ${totalRepliesCount}`);

      // Actualizar el estado con los comentarios cargados
      if (resetList || pageNum === 1) {
        setComments(structuredComments);
      } else {
        setComments(prevComments => [...prevComments, ...structuredComments]);
      }
      
      // Actualizar metadatos
      setMeta(metaData);
      setHasMore(metaData.currentPage < metaData.totalPages);
      setPage(metaData.currentPage);
      
    } catch (error) {
      console.error('Error al obtener comentarios:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los comentarios. Intente nuevamente.",
        variant: "destructive",
      });
      if (page === 1) {
        setComments([]);
      }
    } finally {
      // Garantizar que el estado de carga termine siempre
      setIsLoading(false);
    }
  }, [postId, getBaseApiUrl, toast, isLoading, page, limit, order]);

  // Función para cargar más comentarios
  const loadMoreComments = useCallback(() => {
    if (hasMore && !isLoading) {
      fetchComments(page + 1, false, order);
    }
  }, [fetchComments, hasMore, isLoading, page, order]);

  // Función para cambiar el orden de los comentarios
  const changeCommentsOrder = useCallback((newOrder: string) => {
    if (isLoading || newOrder === order) return;
    
    // Validar que el orden sea uno de los valores permitidos
    const validOrders = ['newest', 'oldest', 'likes_desc', 'likes_asc'];
    if (!validOrders.includes(newOrder)) {
      console.error(`[ERROR] Orden inválido: ${newOrder}. Debe ser uno de: ${validOrders.join(', ')}`);
      return;
    }
    
    console.log(`[DEBUG] Cambiando orden de comentarios: ${order} -> ${newOrder}`);
    setOrder(newOrder);
    // Enviamos el nuevo valor directamente a fetchComments
    fetchComments(1, true, newOrder);
  }, [fetchComments, isLoading, order]);

  // Cargar comentarios al inicio
  useEffect(() => {
    // Indicador para evitar actualizaciones de estado si el componente se desmonta
    let isMounted = true;
    
    const loadComments = async () => {
      // No cargar si ya se ha cargado antes para evitar múltiples peticiones
      if (hasInitiallyLoaded) return;
      
      // Si hay comentarios iniciales, usarlos y marcar como cargado
      if (initialComments && initialComments.length > 0) {
        setHasInitiallyLoaded(true);
        return;
      }
      
      // Si no hay postId, no podemos cargar comentarios
      if (!postId) {
        if (isMounted) {
          setIsLoading(false);
          setHasInitiallyLoaded(true);
        }
        return;
      }
      
      // Si no hay comentarios iniciales, obtenerlos de la API
      await fetchComments(1, true, 'likes_desc');
      if (isMounted) {
        setHasInitiallyLoaded(true);
      }
    };
    
    // Reiniciar estados si cambia el postId
    if (postId) {
      // Solo resetear cuando el postId cambia realmente
      if (!hasInitiallyLoaded) {
        setPage(1);
        setOrder('likes_desc');
        loadComments();
      }
    }
    
    // Cleanup: marcar como desmontado para evitar actualizar estados
    return () => {
      isMounted = false;
    };
  }, [fetchComments, initialComments, postId, hasInitiallyLoaded]);

  // Dar/quitar like a un comentario
  const handleLike = useCallback(async (commentId: string) => {
    if (!user) {
      toast({
        title: "Inicio de sesión requerido",
        description: "Debes iniciar sesión para dar like.",
        variant: "destructive",
      });
      return;
    }

    try {
      const apiUrl = getBaseApiUrl();
      const response = await customFetch(`${apiUrl}/likes/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentId }),
      });
      
      if (!response.ok) {
        throw new Error(`Error al procesar like: ${response.statusText}`);
      }
      
      const responseJson = await response.json();
      console.log('Respuesta like:', responseJson);
      
      // Extraer solo los valores que necesitamos de la respuesta
      let likesCount = 0;
      let liked = false;
      
      // Verificar qué estructura tiene la respuesta
      if (responseJson && typeof responseJson === 'object') {
        // Estructura de respuesta directa: { liked: boolean, likesCount: number }
        if (typeof responseJson.likesCount === 'number') {
          likesCount = responseJson.likesCount;
        } else if (typeof responseJson.count === 'number') {
          likesCount = responseJson.count;
        }
        
        if (typeof responseJson.liked === 'boolean') {
          liked = responseJson.liked;
        }
        
        // Estructura con data: { data: { liked: boolean, likesCount: number } }
        if (responseJson.data && typeof responseJson.data === 'object') {
          if (typeof responseJson.data.likesCount === 'number') {
            likesCount = responseJson.data.likesCount;
          } else if (typeof responseJson.data.count === 'number') {
            likesCount = responseJson.data.count;
          }
          
          if (typeof responseJson.data.liked === 'boolean') {
            liked = responseJson.data.liked;
          }
        }
      }
      
      // Actualizar el estado de comentarios con los valores extraídos
      setComments(prevComments => 
        updateCommentRecursively(prevComments, commentId, comment => ({
          ...comment,
          likes: likesCount,
          hasLiked: liked
        }))
      );
    } catch (error) {
      console.error('Error al dar like al comentario:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar el like. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
    }
  }, [user, getBaseApiUrl, toast]);

  // Responder a un comentario
  const handleReply = useCallback((commentId: string) => {
    if (!user) {
      toast({
        title: "Inicio de sesión requerido",
        description: "Debes iniciar sesión para responder.",
        variant: "destructive",
      });
      return;
    }
    setReplyingTo(commentId);
    setReplyContent("");
  }, [user, toast]);

  // Enviar una respuesta a un comentario
  const submitReply = useCallback(async () => {
    if (!user || !replyingTo || !replyContent.trim() || !postId) {
      return;
    }

    setIsLoading(true); // Indicar que estamos cargando durante la creación de la respuesta

    try {
      const apiUrl = getBaseApiUrl();
      const response = await customFetch(`${apiUrl}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: replyContent.trim(),
          postId,
          parentId: replyingTo
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error al crear respuesta: ${response.statusText}`);
      }
      
      const responseJson = await response.json();
      console.log('Respuesta al crear reply:', responseJson);
      
      // Crear una estructura segura para la respuesta
      const replyData: Partial<Comment> = {
        id: '',
        content: replyContent.trim(),
        likes: 0,
        replies: [],
        createdAt: new Date().toISOString(),
        postId,
        parentId: replyingTo
      };
      
      // Extraer información de la respuesta
      if (responseJson) {
        // Si la respuesta tiene una estructura con data
        const source = responseJson.data || responseJson;
        
        if (source && typeof source === 'object') {
          if (source.id) replyData.id = source.id;
          if (typeof source.content === 'string') replyData.content = source.content;
          if (typeof source.likes === 'number') replyData.likes = source.likes;
          if (source.createdAt) replyData.createdAt = source.createdAt;
          
          // Manejar la información del autor
          if (source.author && typeof source.author === 'object') {
            replyData.author = {
              id: source.author.id || 'unknown',
              name: source.author.name || 'Usuario',
              avatar: source.author.avatar || ''
            };
          } else if (source.authorId && user) {
            // Si solo tenemos authorId pero conocemos al usuario
            replyData.author = {
              id: user.userId,
              name: user.name,
              avatar: user.avatar || ''
            };
          } else if (user) {
            // Usar la información del usuario actual como fallback
            replyData.author = {
              id: user.userId,
              name: user.name,
              avatar: user.avatar || ''
            };
          }
        }
      }
      
      // Asegurar que tenemos un ID válido
      if (!replyData.id) {
        replyData.id = Math.random().toString();
      }
      
      // Convertir a un comentario completo
      const newReply = replyData as Comment;
      
      // Asegurar que el nuevo comentario tenga la estructura correcta
      const structuredNewReply = ensureCommentStructure(newReply);
      
      // Actualizar el estado con la nueva respuesta
      setComments(prevComments => 
        updateCommentRecursively(prevComments, replyingTo, comment => ({
          ...comment,
          replies: [...comment.replies, structuredNewReply]
        }))
      );
      
      // Limpiar el formulario de respuesta
      setReplyingTo(null);
      setReplyContent("");
      
      toast({
        title: "Respuesta enviada",
        description: "Tu respuesta ha sido publicada correctamente."
      });
    } catch (error) {
      console.error('Error al responder al comentario:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar tu respuesta. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false); // Terminar el estado de carga independientemente del resultado
    }
  }, [user, replyingTo, replyContent, postId, getBaseApiUrl, toast]);

  // Añadir un nuevo comentario principal
  const addNewComment = useCallback(async (newCommentContent: string) => {
    if (!user || !newCommentContent.trim() || !postId) {
      return false;
    }

    setIsLoading(true); // Indicar que estamos cargando durante la creación del comentario

    try {
      const apiUrl = getBaseApiUrl();
      const response = await customFetch(`${apiUrl}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newCommentContent.trim(),
          postId,
          parentId: null
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error al crear comentario: ${response.statusText}`);
      }
      
      const responseJson = await response.json();
      console.log('Respuesta al crear comentario:', responseJson);
      
      // Extraer el nuevo comentario con una estructura segura
      const newCommentData: Partial<Comment> = {
        id: '',
        content: newCommentContent.trim(),
        likes: 0,
        replies: [],
        createdAt: new Date().toISOString(),
        postId
      };
      
      // Extraer información de la respuesta
      if (responseJson) {
        // Si la respuesta tiene una estructura con data
        const source = responseJson.data || responseJson;
        
        if (source && typeof source === 'object') {
          if (source.id) newCommentData.id = source.id;
          if (typeof source.content === 'string') newCommentData.content = source.content;
          if (typeof source.likes === 'number') newCommentData.likes = source.likes;
          if (source.createdAt) newCommentData.createdAt = source.createdAt;
          
          // Manejar la información del autor
          if (source.author && typeof source.author === 'object') {
            newCommentData.author = {
              id: source.author.id || 'unknown',
              name: source.author.name || 'Usuario',
              avatar: source.author.avatar || ''
            };
          } else if (source.authorId && user) {
            // Si solo tenemos authorId pero conocemos al usuario
            newCommentData.author = {
              id: user.userId,
              name: user.name,
              avatar: user.avatar || ''
            };
          } else if (user) {
            // Usar la información del usuario actual como fallback
            newCommentData.author = {
              id: user.userId,
              name: user.name,
              avatar: user.avatar || ''
            };
          }
        }
      }
      
      // Asegurar que tenemos un ID válido
      if (!newCommentData.id) {
        newCommentData.id = Math.random().toString();
      }
      
      // Convertir a un comentario completo
      const newComment = newCommentData as Comment;
      
      // Asegurar que la estructura sea segura
      const structuredNewComment = ensureCommentStructure(newComment);
      
      // Añadir el nuevo comentario al inicio de la lista
      setComments(prevComments => [structuredNewComment, ...prevComments]);
      
      toast({
        title: "Comentario enviado",
        description: "Tu comentario ha sido publicado correctamente."
      });
      
      return true;
    } catch (error) {
      console.error('Error al crear comentario:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar tu comentario. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false); // Terminar el estado de carga independientemente del resultado
    }
  }, [user, postId, getBaseApiUrl, toast]);

  // Eliminar un comentario
  const deleteComment = useCallback(async (commentId: string) => {
    if (!user) return;

    try {
      const apiUrl = getBaseApiUrl();
      const response = await customFetch(`${apiUrl}/comments/${commentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error al eliminar comentario: ${response.statusText}`);
      }
      
      // Eliminar el comentario del estado
      setComments(prevComments => removeCommentRecursively(prevComments, commentId));
      
      toast({
        title: "Comentario eliminado",
        description: "El comentario ha sido eliminado correctamente."
      });
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el comentario. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
    }
  }, [user, getBaseApiUrl, toast]);

  // Función auxiliar para actualizar un comentario recursivamente
  const updateCommentRecursively = (comments: Comment[], commentId: string, updateFn: (comment: Comment) => Comment): Comment[] => {
    return comments.map(comment => {
      if (comment.id === commentId) {
        return updateFn(comment);
      }
      if (comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentRecursively(comment.replies, commentId, updateFn)
        };
      }
      return comment;
    });
  };

  // Función auxiliar para eliminar un comentario recursivamente
  const removeCommentRecursively = (comments: Comment[], commentId: string): Comment[] => {
    return comments.filter(comment => {
        if (comment.id === commentId) {
        return false;
      }
      if (comment.replies.length > 0) {
        comment.replies = removeCommentRecursively(comment.replies, commentId);
      }
      return true;
    });
  };

  return {
    comments,
    isLoading,
    replyingTo,
    replyContent,
    handleLike,
    handleReply,
    submitReply,
    setReplyContent,
    addNewComment,
    cancelReply: () => setReplyingTo(null),
    deleteComment,
    loadMoreComments,
    changeCommentsOrder,
    hasMore,
    meta,
    order,
  };
}

  