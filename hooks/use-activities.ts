import { useState, useCallback, useEffect } from "react";
import { customFetch } from "@/lib/customFetch";
import { useAuth } from "@/lib/auth";
import { useToast } from "./use-toast";
import { buildApiUrl } from "@/lib/api";

export interface Activity {
  id: number;
  type: "POST_CREATED" | "COMMENTED" | "LIKED" | "SAVED_POST";
  description: string;
  createdAt: string;
  user: {
    id: string;
    nick: string;
    name: string;
    avatar: string | null;
  };
}

interface ActivityResponse {
  data: Activity[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
  };
}

export function useActivities(nick?: string) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    lastPage: 1,
  });
  
  const auth = useAuth();
  const { toast } = useToast();
  
  const loadActivities = useCallback(async (page: number = 1, limit: number = 10, append: boolean = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Determinar si es el perfil del usuario actual o de otro usuario
      const isCurrentUser = auth.user && (!nick || nick === auth.user.nick);
      
      // Construir la URL dependiendo de si es el usuario actual u otro
      let endpointPath = '';
      if (isCurrentUser) {
        endpointPath = `profile/me/activities`;
      } else if (nick) {
        endpointPath = `profile/${nick}/activities`;
      } else {
        throw new Error("Se necesita un nick para cargar actividades de otro usuario");
      }

      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      const endpoint = buildApiUrl(`${endpointPath}?${params.toString()}`);
      
      // Preparar headers de autenticación si es necesario
      const headers: HeadersInit = {};
      if (isCurrentUser) {
        headers.Authorization = `Bearer ${auth.accessToken}`;
      }
      
      const response = await customFetch(endpoint, { headers });
      
      if (!response.ok) {
        throw new Error(`Error al cargar actividades: ${response.statusText}`);
      }
      
      const data: ActivityResponse = await response.json();
      
      // Si append es true, agregamos las nuevas actividades a las existentes
      // De lo contrario, reemplazamos las actividades existentes
      setActivities(prevActivities => 
        append ? [...prevActivities, ...data.data] : data.data
      );
      
      setPagination({
        page: data.meta.page,
        limit: data.meta.limit,
        total: data.meta.total,
        lastPage: data.meta.lastPage,
      });
    } catch (error) {
      console.error("Error al cargar actividades:", error);
      setError("No se pudieron cargar las actividades. Intenta nuevamente más tarde.");
      
      // Mostrar un toast de error
      toast({
        title: "Error",
        description: "No se pudieron cargar las actividades",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [auth.user, auth.accessToken, nick, toast]);
  
  // Función para cargar más actividades (agregar a la lista existente)
  const loadMore = useCallback(() => {
    if (pagination.page < pagination.lastPage) {
      loadActivities(pagination.page + 1, pagination.limit, true);
    }
  }, [pagination.page, pagination.lastPage, pagination.limit, loadActivities]);
  
  // Función para ir a una página específica (reemplazar la lista existente)
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= pagination.lastPage) {
      loadActivities(page, pagination.limit, false);
    }
  }, [pagination.lastPage, pagination.limit, loadActivities]);
  
  // Cargar actividades iniciales
  useEffect(() => {
    // Solo cargamos si hay un nick o un usuario autenticado
    if (nick || auth.user) {
      loadActivities(1, pagination.limit, false);
    }
  }, [nick, auth.user, loadActivities, pagination.limit]);
  
  return {
    activities,
    isLoading,
    error,
    pagination,
    loadMore,
    goToPage,
    loadActivities,
    hasMore: pagination.page < pagination.lastPage,
  };
} 