import { useState, useCallback, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { useToast } from "./use-toast"
import { customFetch } from "@/lib/customFetch"

// Hook para manejar los posts guardados
export function useSavedPosts() {
  const [savedPostIds, setSavedPostIds] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const auth = useAuth()
  const { toast } = useToast()

  // Función para verificar si un post está guardado
  const isSaved = useCallback((postId: number) => {
    return savedPostIds.includes(postId)
  }, [savedPostIds])

  // Función para cargar los posts guardados
  const loadSavedPostIds = useCallback(async () => {
    // Verificar si hay un usuario autenticado
    if (!auth.user) return

    setIsLoading(true)
    try {
      // Asegurarse de que la URL no tenga barras duplicadas
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      // Eliminar la barra final si existe
      if (apiUrl.endsWith('/')) {
        apiUrl = apiUrl.slice(0, -1)
      }
      const token = auth.accessToken
      
      const response = await customFetch(`${apiUrl}/saved-posts`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al cargar los posts guardados')
      }

      const data = await response.json()
      // Extraer solo los IDs de los posts guardados
      const postIds = data.data ? data.data.map((post: { id: number }) => post.id) : []
      setSavedPostIds(postIds)
    } catch (error) {
      console.error('Error al cargar posts guardados:', error)
    } finally {
      setIsLoading(false)
    }
  }, [auth.user, auth.accessToken])

  // Función para guardar un post
  const savePost = useCallback(async (postId: number) => {
    if (!auth.user) {
      toast({
        title: "Inicia sesión para guardar",
        description: "Necesitas iniciar sesión para guardar posts",
        variant: "destructive"
      })
      return false
    }

    try {
      // Asegurarse de que la URL no tenga barras duplicadas
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
      // Eliminar la barra final si existe
      if (apiUrl.endsWith('/')) {
        apiUrl = apiUrl.slice(0, -1)
      }
      const token = auth.accessToken
      
      const response = await customFetch(`${apiUrl}/saved-posts/${postId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al guardar el post')
      }

      setSavedPostIds(prev => [...prev, postId])
      toast({
        title: "Post guardado",
        description: "El post se ha añadido a tus guardados"
      })
      return true
    } catch (error) {
      console.error('Error al guardar post:', error)
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar este post. Intenta de nuevo.",
        variant: "destructive"
      })
      return false
    }
  }, [auth.user, auth.accessToken, toast])

  // Función para eliminar un post guardado
  const removeSavedPost = useCallback(async (postId: number) => {
    if (!auth.user) return false

    try {
      // Asegurarse de que la URL no tenga barras duplicadas
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      // Eliminar la barra final si existe
      if (apiUrl.endsWith('/')) {
        apiUrl = apiUrl.slice(0, -1)
      }
      const token = auth.accessToken
      
      const response = await customFetch(`${apiUrl}/saved-posts/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al eliminar el post guardado')
      }

      setSavedPostIds(prev => prev.filter(id => id !== postId))
      toast({
        title: "Post eliminado",
        description: "El post se ha eliminado de tus guardados"
      })
      return true
    } catch (error) {
      console.error('Error al eliminar post guardado:', error)
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar este post de guardados. Intenta de nuevo.",
        variant: "destructive"
      })
      return false
    }
  }, [auth.user, auth.accessToken, toast])

  // Función para alternar el estado guardado de un post
  const toggleSavePost = useCallback(async (postId: number) => {
    if (isSaved(postId)) {
      return removeSavedPost(postId)
    } else {
      return savePost(postId)
    }
  }, [isSaved, removeSavedPost, savePost])

  // Cargar los posts guardados al iniciar
  useEffect(() => {
    if (auth.user) {
      loadSavedPostIds()
    }
  }, [auth.user, loadSavedPostIds])

  return {
    isSaved,
    savePost,
    removeSavedPost,
    toggleSavePost,
    loadSavedPostIds,
    isLoading,
    savedPostIds
  }
} 