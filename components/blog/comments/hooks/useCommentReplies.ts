import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import type { Comment } from "@/lib/types"
import { loadCommentsReplies } from "@/utils/comment-utils"
import { registerCommentCallback } from "../utils"

// Hook para manejar las respuestas de un comentario
export function useCommentReplies(commentId: string, originalReplies: Comment[] = []) {
  const [loadedReplies, setLoadedReplies] = useState<Comment[]>([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const { toast } = useToast();

  // Registrar callback para recibir actualizaciones de respuestas
  useEffect(() => {
    const unregister = registerCommentCallback(commentId, (replies) => {
      // Actualizar el estado local directamente
      setLoadedReplies(prev => {
        // Combinar evitando duplicados
        const existingIds = new Set(prev.map(r => r.id));
        const uniqueNewReplies = replies.filter(r => !existingIds.has(r.id));
        
        // Combinar con las respuestas existentes
        return [...prev, ...uniqueNewReplies];
      });
    });
    
    // Limpiar al desmontar
    return () => unregister();
  }, [commentId]);

  // Función para cargar manualmente respuestas
  const handleLoadReplies = async () => {
    // Si ya estamos cargando, no iniciar otra carga
    if (isLoadingReplies) return;
    
    try {
      setIsLoadingReplies(true);
      
      // Usar la función de utilidades para cargar las respuestas
      const replies = await loadCommentsReplies(commentId);
      
      if (replies.length > 0) {
        // Actualizar el estado local directamente
        setLoadedReplies(prevReplies => {
          // Filtrar para no duplicar
          const existingIds = new Set(prevReplies.map(r => r.id));
          const uniqueNewReplies = replies.filter(r => !existingIds.has(r.id));
          
          // Si no hay nuevas respuestas, no actualizar el estado
          if (uniqueNewReplies.length === 0) {
            return prevReplies;
          }
          
          return [...prevReplies, ...uniqueNewReplies];
        });
        
        // Notificar al usuario solo si hay nuevas respuestas visibles
        toast({
          title: "Respuestas cargadas",
          description: `Se encontraron ${replies.length} respuestas para este comentario.`,
          variant: "default",
        });
      } else {
        // Notificar silenciosamente, sin mostrar un toast
        console.debug("No se encontraron respuestas para este comentario.");
      }
    } catch (error) {
      // Capturar el error pero solo mostrar un toast si no es un error 404 (comentario eliminado)
      if (error instanceof Error && error.message.includes("404")) {
        console.debug('El comentario ya no existe');
      } else {
        console.error('Error al cargar respuestas:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las respuestas.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoadingReplies(false);
    }
  };

  // Función para combinar respuestas originales y cargadas
  const combinedReplies = useCallback(() => {
    if (loadedReplies.length === 0) {
      return originalReplies;
    }
    
    // Combinar evitando duplicados
    const existingIds = new Set(originalReplies.map(r => r.id));
    const uniqueNewReplies = loadedReplies.filter(r => !existingIds.has(r.id));
    
    return [...originalReplies, ...uniqueNewReplies];
  }, [originalReplies, loadedReplies]);

  return { 
    loadedReplies, 
    isLoadingReplies, 
    handleLoadReplies, 
    combinedReplies 
  };
} 