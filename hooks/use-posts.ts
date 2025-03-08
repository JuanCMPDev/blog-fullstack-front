import { useState, useEffect, useCallback } from "react"
import { Post, PostStatus } from "@/lib/types"
import { customFetch } from "@/lib/customFetch"
import { toast } from "@/hooks/use-toast"

// Interfaces y tipos para usePost
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

// Interfaces y tipos para usePosts
interface PostsResponse {
  data: Post[]
  meta: {
    total: number
    page: number
    lastPage: number
    limit: number
  }
}

interface UsePostsProps {
  initialLimit?: number
}

type PostsFilter = 'published' | 'draft' | 'scheduled';

interface UsePostsReturn {
  posts: Post[]
  isLoading: boolean
  error: string | null
  currentPage: number
  totalPages: number
  limit: number
  filter: PostsFilter
  searchTerm: string
  activeSearchTerm: string
  setSearchTerm: (term: string) => void
  setFilter: (filter: PostsFilter) => void
  handlePageChange: (page: number) => void
  handleDelete: (postId: number) => Promise<boolean>
  handleStatusChange: (postId: number, publishDate: string | null) => Promise<boolean>
  executeSearch: () => void
  clearSearch: () => void
  refetch: () => Promise<void>
}

// Función auxiliar para obtener la URL base de la API
const getBaseUrl = () => {
  let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  if (apiUrl.endsWith('/')) {
    apiUrl = apiUrl.slice(0, -1)
  }
  return apiUrl
}

// Hook para trabajar con un post individual
export function usePost({ postId }: UsePostProps = {}): UsePostReturn {
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

// Hook para trabajar con listas de posts
export function usePosts({ initialLimit = 10 }: UsePostsProps = {}): UsePostsReturn {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [limit] = useState(initialLimit)
  const [filter, setFilter] = useState<PostsFilter>('published')
  const [searchTerm, setSearchTerm] = useState("")
  const [activeSearchTerm, setActiveSearchTerm] = useState("")

  // Debounce search term para búsquedas automáticas (500ms)
  useEffect(() => {
    // No queremos iniciar búsquedas para términos vacíos o muy cortos
    if (searchTerm.trim().length < 3 && searchTerm.trim().length > 0) return;
    
    const handler = setTimeout(() => {
      setActiveSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Función para ejecutar la búsqueda manualmente
  const executeSearch = useCallback(() => {
    setActiveSearchTerm(searchTerm);
    setCurrentPage(1);
  }, [searchTerm]);

  // Función para limpiar la búsqueda
  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setActiveSearchTerm("");
    setCurrentPage(1);
  }, []);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const apiUrl = getBaseUrl()
      let endpoint = "";
      
      // Si hay un término de búsqueda activo, usamos el endpoint admin/search
      if (activeSearchTerm.trim()) {
        // Mapear el filtro actual al status de la API
        let status: PostStatus | undefined;
        switch (filter) {
          case 'published':
            status = PostStatus.PUBLISHED;
            break;
          case 'draft':
            status = PostStatus.DRAFT;
            break;
          case 'scheduled':
            status = PostStatus.SCHEDULED;
            break;
        }
        
        // Construir la URL con los parámetros de búsqueda
        endpoint = `${apiUrl}/posts/admin/search?page=${currentPage}&limit=${limit}&searchTerm=${encodeURIComponent(activeSearchTerm)}`;
        
        // Sólo añadir el filtro de estado si hay uno seleccionado
        if (status) {
          endpoint += `&status=${status}`;
        }
      } else {
        // Si no hay término de búsqueda, usar los endpoints normales filtrados por estado
        switch(filter) {
          case 'published':
            endpoint = `${apiUrl}/posts/published?page=${currentPage}&limit=${limit}`;
            break;
          case 'draft':
            endpoint = `${apiUrl}/posts/draft?page=${currentPage}&limit=${limit}`;
            break;
          case 'scheduled':
            endpoint = `${apiUrl}/posts/scheduled?page=${currentPage}&limit=${limit}`;
            break;
          default:
            endpoint = `${apiUrl}/posts/published?page=${currentPage}&limit=${limit}`;
        }
      }
      
      const response = await customFetch(endpoint)
      
      if (!response.ok) {
        throw new Error(`Error al cargar los posts: ${response.statusText}`)
      }
      
      const data: PostsResponse = await response.json()
      
      // Si estamos en una página que ya no existe, volvemos a la última página
      if (data.meta.lastPage < currentPage && data.meta.lastPage > 0) {
        setCurrentPage(data.meta.lastPage)
        return
      }

      setPosts(data.data)
      setTotalPages(data.meta.lastPage)
    } catch (err) {
      console.error("Error fetching posts:", err)
      setError(err instanceof Error ? err.message : "Error desconocido al cargar los posts")
      setPosts([])
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, limit, filter, activeSearchTerm])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handleDelete = useCallback(async (postId: number): Promise<boolean> => {
    if (isLoading) return false
    setIsLoading(true)
    try {
      const apiUrl = getBaseUrl()
      const response = await customFetch(`${apiUrl}/posts/${postId}`, {
        method: "DELETE"
      })
      
      if (!response.ok) {
        throw new Error(`Error al eliminar el post: ${response.statusText}`)
      }
      
      // Actualizar la lista localmente antes de refrescar
      setPosts(currentPosts => currentPosts.filter(post => post.id !== postId))
      
      toast({
        title: "Post eliminado",
        description: "El post ha sido eliminado correctamente"
      })
      
      // Si es el último post de la página y no es la primera página, 
      // actualizamos la página actual
      const remainingPosts = posts.filter(post => post.id !== postId)
      if (remainingPosts.length === 0 && currentPage > 1) {
        setCurrentPage(prev => prev - 1)
      } else {
        await fetchPosts()
      }
      
      return true
    } catch (err) {
      console.error("Error deleting post:", err)
      const errorMessage = err instanceof Error ? err.message : "Error desconocido al eliminar el post"
      setError(errorMessage)
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      })
      
      return false
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, posts, fetchPosts, isLoading])

  const handleStatusChange = useCallback(async (postId: number, publishDate: string | null): Promise<boolean> => {
    if (isLoading) return false
    setIsLoading(true)
    try {
      const apiUrl = getBaseUrl()
      const response = await customFetch(`${apiUrl}/posts/${postId}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ publishDate })
      })
      
      if (!response.ok) {
        throw new Error(`Error al actualizar el estado del post: ${response.statusText}`)
      }
      
      const updatedPost = await response.json()
      
      // Determinar el nuevo estado del post
      let newStatus: PostStatus;
      if (!publishDate) {
        newStatus = PostStatus.DRAFT;
      } else {
        const publishDateTime = new Date(publishDate);
        const now = new Date();
        newStatus = publishDateTime > now ? PostStatus.SCHEDULED : PostStatus.PUBLISHED;
      }
      
      // Actualizar la lista localmente antes de refrescar
      setPosts(currentPosts => {
        const newPosts = currentPosts.filter(post => post.id !== postId)
        
        // Solo mantenemos el post en la lista si su nuevo estado coincide con el filtro actual
        const shouldKeepInList = 
          (filter === 'published' && newStatus === PostStatus.PUBLISHED) ||
          (filter === 'draft' && newStatus === PostStatus.DRAFT) ||
          (filter === 'scheduled' && newStatus === PostStatus.SCHEDULED);
        
        if (shouldKeepInList) {
          return [...newPosts, updatedPost]
        }
        return newPosts
      })
      
      // Determinar el mensaje basado en el nuevo estado
      let statusMessage = "El post ha sido guardado como borrador"
      if (publishDate) {
        const publishDateTime = new Date(publishDate)
        const now = new Date()
        
        if (publishDateTime > now) {
          statusMessage = `El post ha sido programado para publicarse el ${publishDateTime.toLocaleDateString()}`
        } else {
          statusMessage = "El post ha sido publicado"
        }
      }
      
      toast({
        title: "Estado actualizado",
        description: statusMessage
      })
      
      // Si es el último post de la página y no es la primera página,
      // actualizamos la página actual
      const remainingPosts = posts.filter(post => post.id !== postId)
      if (remainingPosts.length === 0 && currentPage > 1) {
        setCurrentPage(prev => prev - 1)
      } else {
        await fetchPosts()
      }
      
      return true
    } catch (err) {
      console.error("Error updating post status:", err)
      const errorMessage = err instanceof Error ? err.message : "Error desconocido al actualizar el estado"
      setError(errorMessage)
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      })
      
      return false
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, posts, filter, fetchPosts, isLoading])

  // Cuando cambia el filtro, volvemos a la página 1
  useEffect(() => {
    setCurrentPage(1)
  }, [filter])

  // Resetear página cuando cambia activeSearchTerm
  useEffect(() => {
    setCurrentPage(1)
  }, [activeSearchTerm])

  // Función para refrescar los posts manualmente
  const refetch = useCallback(async () => {
    await fetchPosts()
  }, [fetchPosts])

  return {
    posts,
    isLoading,
    error,
    currentPage,
    totalPages,
    limit,
    filter,
    searchTerm,
    activeSearchTerm,
    setSearchTerm,
    setFilter,
    handlePageChange,
    handleDelete,
    handleStatusChange,
    executeSearch,
    clearSearch,
    refetch
  }
} 