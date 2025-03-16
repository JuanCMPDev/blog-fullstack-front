import { useState } from "react";
import type { Comment } from "@/lib/types";

/**
 * Hook para manejar el estado interno de los comentarios
 */
export function useCommentState(initialComments: Comment[] = []) {
  // Estado principal de comentarios
  const [comments, setComments] = useState<Comment[]>(initialComments);
  
  // Estado para la interacción con comentarios
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para paginación y orden
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

  // Estado para control de carga inicial
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  return {
    // Estados
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
    
    // Función helper para cancelar respuesta
    cancelReply: () => setReplyingTo(null)
  };
} 