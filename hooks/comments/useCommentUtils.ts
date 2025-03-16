import { useCallback } from "react";
import type { Comment } from "@/lib/types";

/**
 * Hook para utilidades comunes de comentarios
 */
export function useCommentUtils() {
  // Función para obtener la URL base de la API
  const getBaseApiUrl = useCallback(() => {
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    // Eliminar la barra final si existe
    if (apiUrl.endsWith('/')) {
      apiUrl = apiUrl.slice(0, -1);
    }
    return apiUrl;
  }, []);

  // Función auxiliar para actualizar un comentario recursivamente
  const updateCommentRecursively = useCallback((comments: Comment[], commentId: string, updateFn: (comment: Comment) => Comment): Comment[] => {
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
  }, []);

  // Función auxiliar para eliminar un comentario recursivamente
  const removeCommentRecursively = useCallback((comments: Comment[], commentId: string): Comment[] => {
    return comments.filter(comment => {
      if (comment.id === commentId) {
        return false;
      }
      if (comment.replies.length > 0) {
        comment.replies = removeCommentRecursively(comment.replies, commentId);
      }
      return true;
    });
  }, []);
  
  return {
    getBaseApiUrl,
    updateCommentRecursively,
    removeCommentRecursively
  };
} 