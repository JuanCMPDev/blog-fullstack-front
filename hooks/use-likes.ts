import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { customFetch } from "@/lib/customFetch";
import { buildPostLikeEndpoint, getLikeHttpMethod } from "@/lib/resource-endpoints";

interface UseLikesReturn {
  hasLiked: boolean;
  likesCount: number;
  toggleLike: () => Promise<void>;
  isLoading: boolean;
}

interface UseLikesProps {
  postId: number | null;
  initialLikesCount: number;
}

export function useLikes({ postId, initialLikesCount }: UseLikesProps): UseLikesReturn {
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Inicializar contador de likes desde props
  useEffect(() => {
    setLikesCount(initialLikesCount);
  }, [initialLikesCount]);

  // Función para dar/quitar like
  const toggleLike = useCallback(async () => {
    if (!user) {
      toast({
        title: "Inicio de sesión requerido",
        description: "Debes iniciar sesión para dar like.",
        variant: "destructive",
      });
      return;
    }
    
    if (!postId) return;
    
    setIsLoading(true);
    
    try {
      const wasLiked = hasLiked;
      const response = await customFetch(buildPostLikeEndpoint(postId), {
        method: getLikeHttpMethod(wasLiked),
      });
      
      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.statusText}`);
      }

      let nextLiked = !wasLiked;
      let nextLikesCount = Math.max(0, likesCount + (nextLiked ? 1 : -1));

      if (response.status !== 204) {
        try {
          const data = await response.json();
          if (typeof data?.liked === 'boolean') {
            nextLiked = data.liked;
          }
          if (typeof data?.likesCount === 'number') {
            nextLikesCount = data.likesCount;
          } else if (typeof data?.count === 'number') {
            nextLikesCount = data.count;
          }
        } catch {
          // Si no hay body JSON, conservamos cálculo local
        }
      }

      setHasLiked(nextLiked);
      setLikesCount(nextLikesCount);
      
      toast({
        title: nextLiked ? "Like agregado" : "Like eliminado",
        description: nextLiked ? "Has dado like a este post" : "Has quitado tu like de este post",
      });
    } catch (error) {
      console.error('Error al dar like:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar la acción de like. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [postId, user, toast, hasLiked, likesCount]);

  return {
    hasLiked,
    likesCount,
    toggleLike,
    isLoading
  };
} 