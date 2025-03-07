import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { postSchema, type PostFormData } from '@/lib/types'
import { useAuth } from '@/lib/auth'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { customFetch } from '@/lib/customFetch'

export const useCreatePost = (initialTags: string[]) => {
  const [slug, setSlug] = useState<string>('')
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
  // Almacenar también el archivo seleccionado:
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [tags, setTags] = useState<string[]>(initialTags)

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
    console.log('Form data:', data)

    // Verificar si el usuario está autenticado
    if (!user) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para crear un post.',
        variant: 'destructive',
      })
      return;
    }

    // Crear el objeto FormData
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('slug', data.slug);
    formData.append('authorId', user.userId); // Usar el userId del usuario autenticado
    formData.append('excerpt', data.excerpt);
    formData.append('content', data.content);
    
    // Para tags, enviar cada tag como un elemento separado con el mismo nombre
    // Esto permite que el backend los reciba como un array
    if (data.tags && data.tags.length > 0) {
      data.tags.forEach(tag => {
        formData.append('tags', tag);
      });
    }
    
    // Solo enviar fecha de publicación si no es borrador
    if (!isDraft) {
      formData.append('publishDate', new Date().toISOString());
    }
    
    formData.append('status', isDraft ? 'DRAFT' : 'PUBLISHED');
    
    // Si hay un archivo seleccionado, agrégalo
    if (coverImageFile) {
      // No necesitas establecer manualmente un nombre si lo deseas; pero si quieres personalizarlo:
      const extension = coverImageFile.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `posts/${data.slug}-${timestamp}.${extension}`;
      formData.append('image', coverImageFile, fileName);
    }

    try {
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}posts`, {
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
      console.log('Post creado:', createdPost)

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
        router.push(`/posts/${createdPost.slug}`);
      }
      
      return createdPost
    } catch (error) {
      console.error('Error al crear el post:', error)
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
  }
}
