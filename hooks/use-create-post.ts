import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { postSchema, type PostFormData } from '@/lib/types'
import { useAuth } from '@/lib/auth'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { customFetch } from '@/lib/customFetch'
import { buildApiUrl } from '@/lib/api'
import { buildCreatePostFormData } from '@/lib/post-create-payload'
import { createLogger } from '@/lib/logger'

const logger = createLogger('useCreatePost')

export const useCreatePost = (initialTags: string[]) => {
  const [slug, setSlug] = useState<string>('')
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
  // Almacenar también el archivo seleccionado:
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [tags, setTags] = useState<string[]>(initialTags)
  const [courseId, setCourseId] = useState<string | null>(null)
  const [courseOrder, setCourseOrder] = useState<number | null>(null)

  const { accessToken, user } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue, // Necesitamos setValue para actualizar el valor de slug en react-hook-form
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      excerpt: '',
      content: '',
      contentV2: '',
      tags: [],
      slug: ''  // Asegurarnos de que slug tenga un valor inicial
    },
  })

  // Actualizar el slug cuando cambia el título
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setValue('title', newTitle) // Actualizar el valor de 'title' en el formulario
    const generatedSlug = generateSlug(newTitle)
    setSlug(generatedSlug)  // Actualizar el estado slug
    setValue('slug', generatedSlug) // Establecer el slug en react-hook-form
  }

  // Función para generar slug
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Eliminar caracteres no alfanuméricos
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .slice(0, 100) // Limitar la longitud del slug a 100 caracteres
  }

  // Manejar el cambio del archivo de imagen
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0]
    if (file) {
      setCoverImageFile(file)
      // Generar URL de preview (opcional)
      setCoverImagePreview(URL.createObjectURL(file))
    }
  }

  // Enviar los datos del formulario usando FormData para enviar archivos
  const onSubmit = async (data: PostFormData, isDraft = false) => {
    if (!user || !accessToken) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para crear un post.',
        variant: 'destructive',
      })
      return;
    }

    let imageFileName: string | undefined
    if (coverImageFile) {
      const extension = coverImageFile.name.split('.').pop()
      const timestamp = Date.now()
      imageFileName = `posts/${data.slug}-${timestamp}.${extension}`
    }

    const status = isDraft ? 'DRAFT' : 'PUBLISHED'
    const formData = buildCreatePostFormData({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      contentV2: data.contentV2,
      tags: data.tags,
      status,
      publishDate: !isDraft ? new Date().toISOString() : undefined,
      image: coverImageFile,
      imageFileName,
      courseId,
      courseOrder,
    })

    try {
      const response = await customFetch(buildApiUrl('posts'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // Importante: No establecer Content-Type manualmente cuando usas FormData.
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Error al crear el post')
      }

      const createdPost = await response.json()

      // Mensaje de éxito
      toast({
        title: isDraft ? 'Borrador guardado' : 'Post publicado',
        description: isDraft 
          ? 'El borrador ha sido guardado correctamente' 
          : 'El post ha sido publicado correctamente',
      })

      // Redirigir según si es borrador o publicado
      if (isDraft) {
        router.push('/admin/posts');
      } else {
        router.push(`/post/${createdPost.slug}`);
      }
      
      return createdPost
    } catch (error) {
      logger.error('Error al crear el post', error)
      // Aquí puedes manejar el error mostrando un mensaje al usuario
      toast({
        title: 'Error',
        description: 'No se pudo crear el post. Intenta nuevamente más tarde.',
        variant: 'destructive',
      })
    }
  }

  return {
    register,
    handleSubmit,
    control,
    errors,
    setValue,
    slug,
    setSlug,
    coverImagePreview,
    setCoverImagePreview,
    coverImageFile,
    setCoverImageFile,  // Exponer la función para establecer el archivo
    handleCoverImageChange,
    tags,
    setTags,
    handleTitleChange,
    onSubmit,
    courseId,
    setCourseId,
    courseOrder,
    setCourseOrder,
  }
}
