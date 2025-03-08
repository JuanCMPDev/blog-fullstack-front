import React, { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { usePost } from "@/hooks/use-posts"
import type { Post } from "@/lib/types"

interface PostEditRenderData {
  post: Post | null
  isLoading: boolean
  error: string | null
  isSaving: boolean
  selectedImage: File | null
  imagePreview: string | null
  handlers: {
    handleSubmit: (updatedPost: Partial<Post>) => Promise<void>
    handleImageChange: (file: File | null) => void
    handleImageRemove: () => void
    handleCancel: () => void
  }
}

interface PostEditContainerProps {
  postId: number
  render: (data: PostEditRenderData) => React.ReactNode
}

export function PostEditContainer({ postId, render }: PostEditContainerProps) {
  const router = useRouter()
  const { post, isLoading, error, updatePost } = usePost({ postId })
  const [isSaving, setIsSaving] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageWasRemoved, setImageWasRemoved] = useState(false)

  const handleImageChange = useCallback((file: File | null) => {
    if (file) {
      setSelectedImage(file)
      setImageWasRemoved(false)
      
      // Crear una URL para previsualizar la imagen
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setSelectedImage(null)
      setImagePreview(null)
      setImageWasRemoved(true)
    }
  }, [])

  const handleImageRemove = useCallback(() => {
    setSelectedImage(null)
    setImagePreview(null)
    setImageWasRemoved(true)
  }, [])

  const handleSubmit = useCallback(async (updatedPost: Partial<Post>) => {
    if (!post) return
    
    setIsSaving(true)
    
    try {
      // Determinar si necesitamos enviar la imagen
      let imageToSend: File | null | undefined = undefined
      
      if (imageWasRemoved) {
        // Si el usuario eliminó la imagen, enviamos null para indicar que se debe eliminar
        imageToSend = null
      } else if (selectedImage) {
        // Si hay una nueva imagen seleccionada, verificamos si es diferente a la actual
        // Nota: Aquí solo podemos comparar por nombre, tamaño, tipo, etc.
        // Una comparación perfecta requeriría comparar el contenido binario
        imageToSend = selectedImage
      }
      
      const success = await updatePost(updatedPost, imageToSend)
      
      if (success) {
        router.push('/admin/posts')
      }
    } catch (err) {
      console.error('Error al guardar el post:', err)
    } finally {
      setIsSaving(false)
    }
  }, [updatePost, selectedImage, imageWasRemoved, post, router])

  const handleCancel = useCallback(() => {
    router.push('/admin/posts')
  }, [router])

  return render({
    post,
    isLoading,
    error,
    isSaving,
    selectedImage,
    imagePreview,
    handlers: {
      handleSubmit,
      handleImageChange,
      handleImageRemove,
      handleCancel
    }
  })
} 