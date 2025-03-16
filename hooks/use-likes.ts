import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { customFetch } from "@/lib/customFetch";

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

  // Función para obtener la URL base de la API
  const getBaseApiUrl = useCallback(() => {
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    // Eliminar la barra final si existe
    if (apiUrl.endsWith('/')) {
      apiUrl = apiUrl.slice(0, -1);
    }
    return apiUrl;
  }, []);

  // Verificar el estado del like actual
  const checkLikeStatus = useCallback(async () => {
    if (!postId || !user) {
      setHasLiked(false);
      return;
    }
    
    try {
      const apiUrl = getBaseApiUrl();
      const response = await customFetch(`${apiUrl}/likes/post/${postId}/check`);
      
      if (response.ok) {
        const data = await response.json();
        setHasLiked(data.liked);
        setLikesCount(data.likesCount);
      }
    } catch (error) {
      console.error('Error al verificar el estado del like:', error);
      setHasLiked(false);
    }
  }, [postId, user, getBaseApiUrl]);

  // Comprobar el estado del like al cargar el componente
  useEffect(() => {
    checkLikeStatus();
  }, [checkLikeStatus]);

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
      const apiUrl = getBaseApiUrl();
      const response = await customFetch(`${apiUrl}/likes/post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
      });
      
      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Actualizar el estado local
      setHasLiked(data.liked);
      setLikesCount(data.likesCount);
      
      toast({
        title: data.liked ? "Like agregado" : "Like eliminado",
        description: data.liked ? "Has dado like a este post" : "Has quitado tu like de este post",
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
  }, [postId, user, toast, getBaseApiUrl]);

  return {
    hasLiked,
    likesCount,
    toggleLike,
    isLoading
  };
} 