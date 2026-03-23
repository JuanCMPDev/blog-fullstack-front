import { useCallback } from "react"
import type { Comment } from "@/lib/types"

// Hook para manejar las respuestas de un comentario
export function useCommentReplies(_commentId: string, originalReplies: Comment[] = []) {

  // En el contrato actual del backend, todas las respuestas anidadas del comentario
  // ya llegan en comment.replies para la página de raíces actual.
  const combinedReplies = useCallback(() => {
    return originalReplies;
  }, [originalReplies]);

  return { 
    loadedReplies: originalReplies,
    isLoadingReplies: false,
    handleLoadReplies: async () => {},
    combinedReplies 
  };
} 