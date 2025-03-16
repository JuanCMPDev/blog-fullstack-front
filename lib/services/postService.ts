import { customFetch } from "@/lib/customFetch";
import type { Post } from "@/lib/types";

// Interfaz para la respuesta paginada de la API
interface ApiResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
  };
}

// URL base de la API (debería estar en un archivo de configuración o variable de entorno)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Obtiene los posts recomendados desde la API
 * @param limit Número de posts a obtener (por defecto 3)
 * @returns Promise con los posts recomendados
 */
export async function getRecommendedPosts(limit: number = 3): Promise<Post[]> {
  try {
    const response = await customFetch(`${API_URL}posts/recommended?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Error al obtener posts recomendados: ${response.status}`);
    }
    
    const data: ApiResponse<Post> = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error al obtener posts recomendados:", error);
    return [];
  }
}

/**
 * Obtiene todos los posts con paginación
 * @param page Número de página
 * @param limit Número de posts por página
 * @returns Promise con los posts y metadatos de paginación
 */
export async function getPosts(page: number = 1, limit: number = 10): Promise<ApiResponse<Post>> {
  try {
    const response = await customFetch(`${API_URL}posts?page=${page}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Error al obtener posts: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error al obtener posts:", error);
    return { data: [], meta: { total: 0, page, lastPage: 1, limit } };
  }
} 