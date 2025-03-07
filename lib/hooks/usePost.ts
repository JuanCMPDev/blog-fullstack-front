import { useState, useEffect, useCallback } from "react"
import type { Post } from "@/lib/types"
import { customFetch } from "../customFetch"
import { toast } from "@/hooks/use-toast"
interface UsePostProps {
  postId?: number
}

interface UsePostReturn {
  post: Post | null
  isLoading: boolean
  error: string | null
  updatePost: (updatedPost: Partial<Post>, newImage?: File | null) => Promise<boolean>
  fetchPost: () => Promise<void>
}

export function usePost({ postId }: UsePostProps = {}): UsePostReturn {
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getBaseUrl = () => {
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    if (apiUrl.endsWith('/')) {
      apiUrl = apiUrl.slice(0, -1)
    }
    return apiUrl
  }

  const fetchPost = useCallback(async () => {
    if (!postId) {
      setPost(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const apiUrl = getBaseUrl()
      const response = await customFetch(`${apiUrl}/posts/${postId}`)
      
      if (!response.ok) {
        throw new Error(`Error al cargar el post: ${response.statusText}`)
      }
      
      const data = await response.json()
      setPost(data)
    } catch (err) {
      console.error("Error fetching post:", err)
      setError(err instanceof Error ? err.message : "Error desconocido al cargar el post")
      setPost(null)
    } finally {
      setIsLoading(false)
    }
  }, [postId])

  useEffect(() => {
    fetchPost()
  }, [fetchPost])

  const updatePost = useCallback(async (updatedPost: Partial<Post>, newImage?: File | null): Promise<boolean> => {
    if (!postId || !post) {
      setError("No hay un post para actualizar")
      return false
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const apiUrl = getBaseUrl()
      
      // Determinar si necesitamos subir una nueva imagen
      let imageUrl: string | null = post.coverImage
      
      // Si newImage es undefined, no se ha tocado la imagen, así que mantenemos la actual
      // Si newImage es null, el usuario quiere eliminar la imagen
      // Si newImage es un File, el usuario quiere cambiar la imagen
      
      if (newImage === null) {
        // El usuario quiere eliminar la imagen
        imageUrl = null
      } else if (newImage instanceof File) {
        // El usuario quiere cambiar la imagen, subimos la nueva
        console.log("Subiendo nueva imagen:", newImage.name)
        
        const formData = new FormData()
        formData.append('image', newImage)
        
        const uploadResponse = await customFetch(`${apiUrl}/posts/upload`, {
          method: 'POST',
          body: formData
        })
        
        if (!uploadResponse.ok) {
          throw new Error(`Error al subir la imagen: ${uploadResponse.statusText}`)
        }
        
        const uploadData = await uploadResponse.json()
        imageUrl = uploadData.imageUrl
      }
      
      // Actualizar el post con todos los datos, incluyendo la URL de la imagen
      const postData = {
        ...updatedPost,
        coverImage: imageUrl
      }
      
      console.log("Actualizando post con datos:", postData)
      
      const updateResponse = await customFetch(`${apiUrl}/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      })

      toast({
        title: "Post actualizado",
        description: "El post ha sido actualizado correctamente"
      })
      
      if (!updateResponse.ok) {
        throw new Error(`Error al actualizar el post: ${updateResponse.statusText}`)
      }
      
      const updatedData = await updateResponse.json()
      setPost(updatedData)
      return true
    } catch (err) {
      console.error("Error updating post:", err)
      setError(err instanceof Error ? err.message : "Error desconocido al actualizar el post")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [post, postId])

  return {
    post,
    isLoading,
    error,
    updatePost,
    fetchPost
  }
} 