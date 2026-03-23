import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import type { Comment, UseCommentsReturn } from "@/lib/types"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { customFetch } from "@/lib/customFetch"
import { buildCommentLikeEndpoint, buildPostCommentsEndpoint, getLikeHttpMethod } from "@/lib/resource-endpoints"
import { buildApiUrl } from "@/lib/api"
import { createLogger } from "@/lib/logger"
import { createCommentsTelemetry } from "@/lib/comments-telemetry"

const logger = createLogger("useComments")

// Interfaz para datos de comentarios de la API
interface ApiCommentData {
  id: string;
  content?: string;
  author?: {
    id?: string;
    nick?: string;
    name?: string;
    avatar?: string;
  };
  authorId?: string;
  likes?: number;
  hasLiked?: boolean;
  replies?: ApiCommentData[];
  createdAt?: string;
  updatedAt?: string;
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
          nick: comment.author.nick,
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
  const likingInFlight = useState(() => new Set<string>())[0]
  const orderChangeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [isFetchingList, setIsFetchingList] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [commentsError, setCommentsError] = useState<string | null>(null)
  const [liveMessage, setLiveMessage] = useState("")
  const [commentFeedback, setCommentFeedback] = useState<string | null>(null)
  const [replyFeedback, setReplyFeedback] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()
  const telemetry = useMemo(() =>
    createCommentsTelemetry((event) => {
      logger.info("comments_telemetry", event)
    })
  , [])

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
      setIsFetchingList(false);
      setIsLoadingMore(false);
      return;
    }
    
    // Evitar iniciar una nueva carga si ya está en proceso
    if ((isFetchingList || isLoadingMore) && pageNum === page) return;

    const currentOrder = orderValue || order;
    const isLoadMore = pageNum > 1 && !resetList;

    setCommentsError(null);
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setIsFetchingList(true);
    }

    const telemetryToken = telemetry.start("fetch_comments", {
      postId,
      page: pageNum,
      order: currentOrder,
      resetList,
    })
    
    try {
      // Usar el valor de orden pasado directamente o el del estado
      
      // El backend espera directamente los valores: newest, oldest, likes_desc, likes_asc
      // No necesitamos hacer conversión, usamos el valor directamente
      
      // Usar el nuevo endpoint que ya devuelve la estructura completa de comentarios anidados
      const endpoint = buildPostCommentsEndpoint(postId, {
        page: pageNum,
        limit,
        order: currentOrder,
      });
      logger.debug(`Cargando comentarios desde: ${endpoint}`)
      
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
        if (resetList) {
          setComments([]);
        }
        setMeta(metaData);
        setHasMore(false);
        setPage(metaData.currentPage);
        telemetry.success(telemetryToken, {
          commentsCount: 0,
          totalItems: metaData.totalItems,
          totalPages: metaData.totalPages,
        })
        setIsFetchingList(false);
        setIsLoadingMore(false);
        return;
      }
      
      logger.debug(`Se encontraron ${commentsData.length} comentarios principales con sus respuestas anidadas`)
      
      // Asegurar que cada comentario tenga la estructura correcta (recursivamente)
      const ensureNestedStructure = (comment: ApiCommentData): Comment => {
        const baseComment: Comment = {
          id: comment.id,
          content: comment.content || '',
          likes: comment.likes || 0,
          replies: [],
          createdAt: comment.createdAt || new Date().toISOString(),
          updatedAt: typeof comment.updatedAt === 'string' ? comment.updatedAt : undefined,
          postId: comment.postId || undefined,
          parentId: comment.parentId,
          hasLiked: typeof comment.hasLiked === 'boolean' ? comment.hasLiked : false,
          author: comment.author
            ? {
                id: comment.author.id || 'unknown',
                nick: comment.author.nick,
                name: comment.author.name || 'Usuario',
                avatar: comment.author.avatar || ''
              }
            : {
                id: comment.authorId || 'unknown',
                name: 'Usuario',
                avatar: ''
              }
        };

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
      logger.debug(`Total de respuestas cargadas en todos los niveles: ${totalRepliesCount}`)

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
      telemetry.success(telemetryToken, {
        commentsCount: structuredComments.length,
        totalItems: metaData.totalItems,
        totalPages: metaData.totalPages,
      })
      
    } catch (error) {
      telemetry.error(telemetryToken, error, {
        page: pageNum,
      })
      setCommentsError("No se pudieron cargar los comentarios. Intenta nuevamente.")
      logger.error('Error al obtener comentarios', error)
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
      setIsFetchingList(false);
      setIsLoadingMore(false);
    }
  }, [postId, toast, isFetchingList, isLoadingMore, page, limit, order, telemetry]);

  // Función para cargar más comentarios
  const loadMoreComments = useCallback(() => {
    if (hasMore && !isLoadingMore && !isFetchingList) {
      fetchComments(page + 1, false, order);
    }
  }, [fetchComments, hasMore, isLoadingMore, isFetchingList, page, order]);

  const retryComments = useCallback(() => {
    fetchComments(1, true, order)
  }, [fetchComments, order]);

  // Función para cambiar el orden de los comentarios (con debounce de 300ms)
  const changeCommentsOrder = useCallback((newOrder: string) => {
    if (newOrder === order) return;

    const validOrders = ['newest', 'oldest', 'likes_desc', 'likes_asc'];
    if (!validOrders.includes(newOrder)) {
      logger.error(`Orden inválido: ${newOrder}. Debe ser uno de: ${validOrders.join(', ')}`)
      return;
    }

    if (orderChangeTimer.current) {
      clearTimeout(orderChangeTimer.current);
    }

    orderChangeTimer.current = setTimeout(() => {
      if (isFetchingList || isLoadingMore) return;
      logger.debug(`Cambiando orden de comentarios: ${order} -> ${newOrder}`)
      setOrder(newOrder);
      fetchComments(1, true, newOrder);
    }, 300);
  }, [fetchComments, isFetchingList, isLoadingMore, order, orderChangeTimer]);

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
          setIsFetchingList(false);
          setIsLoadingMore(false);
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

    // Evitar peticiones duplicadas mientras hay una en curso para este comentario
    if (likingInFlight.has(commentId)) return;
    likingInFlight.add(commentId);

    try {
      const findCommentById = (commentsList: Comment[], id: string): Comment | null => {
        for (const comment of commentsList) {
          if (comment.id === id) {
            return comment;
          }
          if (comment.replies.length > 0) {
            const foundInReplies = findCommentById(comment.replies, id);
            if (foundInReplies) {
              return foundInReplies;
            }
          }
        }
        return null;
      };

      const currentComment = findCommentById(comments, commentId);
      const wasLiked = Boolean(currentComment?.hasLiked);
      const currentLikes = typeof currentComment?.likes === 'number' ? currentComment.likes : 0;

      const response = await customFetch(buildCommentLikeEndpoint(commentId), {
        method: getLikeHttpMethod(wasLiked),
      });
      
      if (!response.ok) {
        throw new Error(`Error al procesar like: ${response.statusText}`);
      }
      
      let liked = !wasLiked;
      let likesCount = Math.max(0, currentLikes + (liked ? 1 : -1));

      if (response.status !== 204) {
        try {
          const responseJson = await response.json();
          logger.debug("Respuesta like", { responseJson });
          if (responseJson && typeof responseJson === 'object') {
            if (typeof responseJson.likesCount === 'number') {
              likesCount = responseJson.likesCount;
            } else if (typeof responseJson.count === 'number') {
              likesCount = responseJson.count;
            }
            
            if (typeof responseJson.liked === 'boolean') {
              liked = responseJson.liked;
            }
            
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
        } catch {
          // Sin body JSON: usamos cálculo local
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
      logger.error('Error al dar like al comentario', error);
      toast({
        title: "Error",
        description: "No se pudo procesar el like. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
    } finally {
      likingInFlight.delete(commentId);
    }
  }, [user, toast, comments, likingInFlight]);

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
    setReplyFeedback(null)
  }, [user, toast]);

  // Enviar una respuesta a un comentario
  const submitReply = useCallback(async () => {
    if (!user || !replyingTo || !replyContent.trim() || !postId) {
      return;
    }

    const telemetryToken = telemetry.start("submit_reply", {
      postId,
      parentId: replyingTo,
      contentLength: replyContent.trim().length,
    })

    const trimmedReply = replyContent.trim()
    const optimisticReplyId = `temp-reply-${Date.now()}`
    const optimisticReply = ensureCommentStructure({
      id: optimisticReplyId,
      content: trimmedReply,
      likes: 0,
      replies: [],
      createdAt: new Date().toISOString(),
      postId,
      parentId: replyingTo,
      author: user
        ? {
            id: user.userId,
            nick: user.nick,
            name: user.name,
            avatar: user.avatar || "",
          }
        : {
            id: "unknown",
            name: "Usuario",
            avatar: "",
          },
    } as Comment)

    setIsSubmittingReply(true);
    setReplyFeedback("Enviando respuesta...")
    setComments(prevComments =>
      updateCommentRecursively(prevComments, replyingTo, comment => ({
        ...comment,
        replies: [...comment.replies, optimisticReply],
      }))
    )

    try {
      const response = await customFetch(buildApiUrl("comments"), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: trimmedReply,
          postId,
          parentId: replyingTo
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error al crear respuesta: ${response.statusText}`);
      }
      
      const responseJson = await response.json();
      logger.debug("Respuesta al crear reply", { responseJson });
      
      // Crear una estructura segura para la respuesta
      const replyData: Partial<Comment> = {
        id: '',
        content: trimmedReply,
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
              nick: source.author.nick || user?.nick,
              name: source.author.name || 'Usuario',
              avatar: source.author.avatar || ''
            };
          } else if (user) {
            replyData.author = {
              id: user.userId,
              nick: user.nick,
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
      
      // Reemplazar la respuesta optimista por la respuesta real
      setComments(prevComments => 
        updateCommentRecursively(prevComments, optimisticReplyId, () => structuredNewReply)
      );
      
      // Limpiar el formulario de respuesta
      setReplyingTo(null);
      setReplyContent("");
      
      toast({
        title: "Respuesta enviada",
        description: "Tu respuesta ha sido publicada correctamente."
      });
      setReplyFeedback("Respuesta publicada")
      setLiveMessage("Respuesta enviada correctamente")
      telemetry.success(telemetryToken, {
        replyId: structuredNewReply.id,
      })
    } catch (error) {
      setComments(prevComments => removeCommentRecursively(prevComments, optimisticReplyId))
      setReplyFeedback("No se pudo enviar la respuesta")
      telemetry.error(telemetryToken, error)
      logger.error('Error al responder al comentario', error);
      toast({
        title: "Error",
        description: "No se pudo enviar tu respuesta. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReply(false);
    }
  }, [user, replyingTo, replyContent, postId, toast, telemetry]);

  // Añadir un nuevo comentario principal
  const addNewComment = useCallback(async (newCommentContent: string) => {
    if (!user || !newCommentContent.trim() || !postId) {
      return false;
    }

    const telemetryToken = telemetry.start("submit_comment", {
      postId,
      contentLength: newCommentContent.trim().length,
    })

    const trimmedContent = newCommentContent.trim()
    const optimisticCommentId = `temp-comment-${Date.now()}`
    const optimisticComment = ensureCommentStructure({
      id: optimisticCommentId,
      content: trimmedContent,
      likes: 0,
      replies: [],
      createdAt: new Date().toISOString(),
      postId,
      author: user
        ? {
            id: user.userId,
            nick: user.nick,
            name: user.name,
            avatar: user.avatar || "",
          }
        : {
            id: "unknown",
            name: "Usuario",
            avatar: "",
          },
    } as Comment)

    setIsSubmittingComment(true);
    setCommentFeedback("Enviando comentario...")
    setComments(prevComments => [optimisticComment, ...prevComments]);

    try {
      const response = await customFetch(buildApiUrl("comments"), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: trimmedContent,
          postId,
          parentId: null
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error al crear comentario: ${response.statusText}`);
      }
      
      const responseJson = await response.json();
      logger.debug("Respuesta al crear comentario", { responseJson });
      
      // Extraer el nuevo comentario con una estructura segura
      const newCommentData: Partial<Comment> = {
        id: '',
        content: trimmedContent,
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
              nick: source.author.nick || user?.nick,
              name: source.author.name || 'Usuario',
              avatar: source.author.avatar || ''
            };
          } else if (user) {
            newCommentData.author = {
              id: user.userId,
              nick: user.nick,
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
      
      // Reemplazar el comentario optimista por el comentario real
      setComments(prevComments =>
        prevComments.map(comment =>
          comment.id === optimisticCommentId ? structuredNewComment : comment
        )
      );
      
      toast({
        title: "Comentario enviado",
        description: "Tu comentario ha sido publicado correctamente."
      });
      setCommentFeedback("Comentario publicado")
      setLiveMessage("Comentario enviado correctamente")
      telemetry.success(telemetryToken, {
        commentId: structuredNewComment.id,
      })
      
      return true;
    } catch (error) {
      setComments(prevComments => prevComments.filter(comment => comment.id !== optimisticCommentId));
      setCommentFeedback("No se pudo enviar el comentario")
      telemetry.error(telemetryToken, error)
      logger.error('Error al crear comentario', error);
      toast({
        title: "Error",
        description: "No se pudo enviar tu comentario. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmittingComment(false);
    }
  }, [user, postId, toast, telemetry]);

  // Eliminar un comentario
  const deleteComment = useCallback(async (commentId: string) => {
    if (!user) return;

    try {
      const response = await customFetch(buildApiUrl(`comments/${commentId}`), {
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
      logger.error('Error al eliminar comentario', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el comentario. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Editar un comentario
  const editComment = useCallback(async (commentId: string, newContent: string) => {
    if (!user) return;

    try {
      const response = await customFetch(buildApiUrl(`comments/${commentId}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      });

      if (!response.ok) {
        throw new Error(`Error al editar comentario: ${response.statusText}`);
      }

      setComments(prevComments =>
        updateCommentRecursively(prevComments, commentId, comment => ({
          ...comment,
          content: newContent,
          updatedAt: new Date().toISOString(),
        }))
      );

      toast({
        title: "Comentario actualizado",
        description: "El comentario ha sido editado correctamente.",
      });
    } catch (error) {
      logger.error('Error al editar comentario', error);
      toast({
        title: "Error",
        description: "No se pudo editar el comentario. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Función auxiliar para actualizar un comentario recursivamente
  const updateCommentRecursively = (comments: Comment[], commentId: string, updateFn: (comment: Comment) => Comment): Comment[] => {
    return comments.map(comment => {
      if (comment.id === commentId) {
        return updateFn(comment);
      }
      if (Array.isArray(comment.replies) && comment.replies.length > 0) {
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
    return comments
      .filter(comment => comment.id !== commentId)
      .map(comment => ({
        ...comment,
        replies: Array.isArray(comment.replies) ? removeCommentRecursively(comment.replies, commentId) : []
      }));
  };

  return {
    comments,
    isFetchingList,
    isSubmittingComment,
    isSubmittingReply,
    isLoadingMore,
    commentsError,
    liveMessage,
    commentFeedback,
    replyFeedback,
    replyingTo,
    replyContent,
    handleLike,
    handleReply,
    submitReply,
    setReplyContent,
    addNewComment,
    cancelReply: () => {
      setReplyingTo(null)
      setReplyFeedback(null)
    },
    deleteComment,
    editComment,
    loadMoreComments,
    retryComments,
    changeCommentsOrder,
    hasMore,
    meta,
    order,
  };
}

  