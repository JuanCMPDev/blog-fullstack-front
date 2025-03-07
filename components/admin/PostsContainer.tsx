import { useRouter } from "next/navigation"
import { usePosts } from "@/hooks/use-posts"
import type { Post } from "@/lib/types"
import { useCallback } from "react"

interface PostsRenderData {
  posts: Post[]
  isLoading: boolean
  error: string | null
  currentPage: number
  totalPages: number
  filter: 'published' | 'draft' | 'scheduled'
  searchTerm: string
  activeSearchTerm: string
  handlers: {
    handlePageChange: (page: number) => void
    handleDelete: (postId: number) => Promise<boolean>
    handleEdit: (postId: number) => void
    handleStatusChange: (postId: number, publishDate: string | null) => Promise<boolean>
    setSearchTerm: (term: string) => void
    setFilter: (filter: 'published' | 'draft' | 'scheduled') => void
    executeSearch: () => void
    clearSearch: () => void
    refetch: () => Promise<void>
  }
}

interface PostsContainerProps {
  render: (data: PostsRenderData) => React.ReactNode
  initialLimit?: number
}

export function PostsContainer({ render, initialLimit = 10 }: PostsContainerProps) {
  const router = useRouter()
  
  const {
    posts,
    isLoading,
    error,
    currentPage,
    totalPages,
    filter,
    searchTerm,
    activeSearchTerm,
    setSearchTerm,
    setFilter,
    handlePageChange,
    handleDelete: baseHandleDelete,
    handleStatusChange: baseHandleStatusChange,
    executeSearch,
    clearSearch,
    refetch
  } = usePosts({ initialLimit })

  const handleEdit = useCallback((postId: number) => {
    router.push(`/admin/posts/edit/${postId}`)
  }, [router])

  const handleDelete = useCallback(async (postId: number): Promise<boolean> => {
    try {
      const success = await baseHandleDelete(postId)
      if (success) {
        // Si estamos en la última página y solo queda un post, retrocedemos una página
        if (currentPage > 1 && posts.length === 1) {
          handlePageChange(currentPage - 1)
        } else {
          await refetch()
        }
      }
      return success
    } catch (error) {
      console.error("Error en handleDelete:", error)
      return false
    }
  }, [baseHandleDelete, currentPage, posts.length, handlePageChange, refetch])

  const handleStatusChange = useCallback(async (postId: number, publishDate: string | null): Promise<boolean> => {
    try {
      const success = await baseHandleStatusChange(postId, publishDate)
      if (success) {
        await refetch()
      }
      return success
    } catch (error) {
      console.error("Error en handleStatusChange:", error)
      return false
    }
  }, [baseHandleStatusChange, refetch])

  return render({
    posts,
    isLoading,
    error,
    currentPage,
    totalPages,
    filter,
    searchTerm,
    activeSearchTerm,
    handlers: {
      handlePageChange,
      handleDelete,
      handleEdit,
      handleStatusChange,
      setSearchTerm,
      setFilter,
      executeSearch,
      clearSearch,
      refetch
    }
  })
} 