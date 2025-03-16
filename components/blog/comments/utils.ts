import type { Comment } from "@/lib/types"
import { convertApiReplyToComment } from "@/utils/comment-utils"
import { ApiReply } from "./types"

// Crear un evento personalizado para comunicar la carga de respuestas
export const commentEventsMap = new Map<string, ((replies: Comment[]) => void)[]>();

// Función global para registrar callbacks de actualización
export function registerCommentCallback(commentId: string, callback: (replies: Comment[]) => void) {
  if (!commentEventsMap.has(commentId)) {
    commentEventsMap.set(commentId, []);
  }
  commentEventsMap.get(commentId)?.push(callback);
  
  // Devolver función para eliminar el callback
  return () => {
    const callbacks = commentEventsMap.get(commentId);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  };
}

// Función global para disparar eventos de actualización
export function triggerCommentUpdate(commentId: string, replies: ApiReply[]) {
  const callbacks = commentEventsMap.get(commentId);
  if (callbacks) {
    // Convertir las respuestas de la API al formato de Comment antes de pasarlas al callback
    const processedReplies: Comment[] = replies.map(reply => 
      convertApiReplyToComment({
        ...reply,
        parentId: reply.parentId || commentId
      })
    );
    
    callbacks.forEach(callback => callback(processedReplies));
  }
}


  export const getDepthStyles = (depth: number): string => {
    switch (depth) {
      case 0:
        return ""
      case 1:
        return "ml-8"
      case 2:
        return "ml-12"
      case 3:
      default:
        return "ml-16"
    }
  }
  
  // Función para formatear la fecha de creación
  export const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("es", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    } catch {
      return ""
    }
  }