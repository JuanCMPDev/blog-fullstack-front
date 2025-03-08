"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2, Save, X } from "lucide-react"
import { SimpleCoverImageUpload } from "@/components/admin/SimpleCoverImageUpload"
import { SimpleContentEditor } from "@/components/admin/SimpleContentEditor"
import { SimpleTagInput } from "@/components/admin/SimpleTagInput"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import type { Post } from "@/lib/types"
import { usePost } from "@/hooks/use-posts"

export default function EditPostPage() {
  const params = useParams()
  const router = useRouter()
  const postId = Number(params.id)
  
  // Usar directamente el hook usePost en lugar de PostEditContainer
  const { post, isLoading, error, updatePost } = usePost({ postId })
  const [isSaving, setIsSaving] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageWasRemoved, setImageWasRemoved] = useState(false)
  
  // Definir el estado en el componente principal
  const [formData, setFormData] = useState<Partial<Post>>({
    title: "",
    excerpt: "",
    content: "",
    tags: []
  })
  
  // Referencia para controlar la inicialización
  const initialized = useRef(false)
  
  // Inicializar el formulario cuando el post está disponible
  useEffect(() => {
    if (post && !initialized.current) {
      setFormData({
        title: post.title || "",
        excerpt: post.excerpt || "",
        content: post.content || "",
        tags: post.tags || []
      })
      initialized.current = true
    }
  }, [post])
  
  // Definir las funciones de manejo de cambios
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleContentChange = (value: string) => {
    setFormData(prev => ({ ...prev, content: value }))
  }

  const handleTagsChange = (tags: string[]) => {
    setFormData(prev => ({ ...prev, tags }))
  }
  
  const handleImageChange = (file: File | null) => {
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
    }
  }
  
  const handleImageRemove = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setImageWasRemoved(true)
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsSaving(true)
    
    try {
      // Determinar si necesitamos enviar la imagen
      let imageToSend: File | null | undefined = undefined
      
      if (imageWasRemoved) {
        // Si el usuario eliminó la imagen, enviamos null para indicar que se debe eliminar
        imageToSend = null
      } else if (selectedImage) {
        // Si hay una nueva imagen seleccionada
        imageToSend = selectedImage
      }
      
      const success = await updatePost(formData, imageToSend)
      
      if (success) {
        router.push('/admin/posts')
      }
    } catch (err) {
      console.error('Error al guardar el post:', err)
    } finally {
      setIsSaving(false)
    }
  }
  
  const handleCancel = () => {
    router.push('/admin/posts')
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-60 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Determinar qué imagen mostrar
  const displayImage = imagePreview || (imageWasRemoved ? null : post?.coverImage || null)

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="bg-gradient-to-br from-background to-secondary/20">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Editar Post</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Título del post"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Extracto</Label>
              <Textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="Breve descripción del post"
                className="min-h-[100px]"
                required
              />
            </div>

            <SimpleContentEditor
              value={formData.content || ""}
              onChange={handleContentChange}
            />

            <SimpleTagInput
              tags={formData.tags || []}
              onChange={handleTagsChange}
            />

            <SimpleCoverImageUpload
              currentImage={displayImage}
              previewImage={imagePreview}
              onImageChange={handleImageChange}
              onRemoveImage={handleImageRemove}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar cambios
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}