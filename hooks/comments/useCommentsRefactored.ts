import { useEffect, useCallback } from "react";
import type { Comment, UseCommentsReturn } from "@/lib/types";
import { useCommentState } from "./useCommentState";
import { useCommentUtils } from "./useCommentUtils";
import { useFetchComments } from "./useFetchComments";
import { useCommentInteractions } from "./useCommentInteractions";

interface UseCommentsProps {
  postId: number | null;
  initialComments?: Comment[];
}

/**
 * Hook principal para el manejo de comentarios (versión refactorizada)
 */
export const useCommentsRefactored = ({ postId, initialComments = [] }: UseCommentsProps): UseCommentsReturn => {
  // Asegurar que initialComments sea siempre un array
  const safeInitialComments = Array.isArray(initialComments) ? initialComments : [];
  
  // Gestión de estado
  const {
    comments,
    setComments,
    replyingTo,
    setReplyingTo,
    replyContent, 
    setReplyContent,
    isLoading,
    setIsLoading,
    page,
    setPage,
    limit,
    order,
    setOrder,
    hasMore,
    setHasMore,
    meta,
    setMeta,
    hasInitiallyLoaded,
    setHasInitiallyLoaded,
    cancelReply
  } = useCommentState(safeInitialComments);
  
  // Utilidades generales
  const { getBaseApiUrl, updateCommentRecursively, removeCommentRecursively } = useCommentUtils();
  
  // Operaciones de carga
  const { fetchComments } = useFetchComments({
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
    order
  });
  
  // Operaciones de interacción
  const { 
    handleLike, 
    handleReply, 
    submitReply: handleSubmitReply, 
    addNewComment, 
    deleteComment 
  } = useCommentInteractions({
    postId,
    getBaseApiUrl,
    updateCommentRecursively,
    removeCommentRecursively,
    setComments,
    setReplyingTo,
    setReplyContent,
    setIsLoading
  });
  
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
  }, [fetchComments, isLoading, order, setOrder]);
  
  // Envoltura para submitReply que maneja el estado actual
  const submitReply = useCallback(async () => {
    return handleSubmitReply(replyingTo, replyContent);
  }, [handleSubmitReply, replyingTo, replyContent]);

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
  }, [fetchComments, initialComments, postId, hasInitiallyLoaded, setIsLoading, setHasInitiallyLoaded, setPage, setOrder]);

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
    cancelReply,
    deleteComment,
    loadMoreComments,
    changeCommentsOrder,
    hasMore,
    meta,
    order,
  };
} 