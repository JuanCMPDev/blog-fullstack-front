import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { customFetch } from "@/lib/customFetch";
import type { Comment } from "@/lib/types";

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

interface UseFetchCommentsProps {
  postId: number | null;
  getBaseApiUrl: () => string;
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  setMeta: React.Dispatch<React.SetStateAction<{
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  }>>;
  setHasMore: React.Dispatch<React.SetStateAction<boolean>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  page: number;
  limit: number;
  order: string;
}

/**
 * Hook específico para operaciones de carga de comentarios
 */
export function useFetchComments({
  postId, 
  getBaseApiUrl,
  setComments, 
  setMeta, 
  setHasMore, 
  setPage, 
  setIsLoading,
  isLoading,
  page,
  limit,
  order,
}: UseFetchCommentsProps) {
  const { toast } = useToast();

  // Función para asegurar que cada comentario tenga la estructura correcta (recursivamente)
  const ensureNestedStructure = useCallback((comment: ApiCommentData): Comment => {
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
  }, []);

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
      console.log(`[DEBUG] Ejecutando fetchComments con orden: ${currentOrder}`);
      
      // Usar el endpoint que devuelve la estructura completa de comentarios anidados
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
  }, [postId, getBaseApiUrl, toast, isLoading, page, limit, order, setComments, setMeta, setHasMore, setPage, setIsLoading, ensureNestedStructure]);

  return {
    fetchComments
  };
} 