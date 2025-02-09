"use client"

import { use } from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { ContentEditor } from "@/components/admin/ContentEditor"
import { TagInput } from "@/components/admin/TagInput"
import { CoverImageUpload } from "@/components/admin/CoverImageUpload"
import { postSchema, type PostFormData, type Post } from "@/lib/types"
import { mockPosts } from "@/lib/mock-posts"

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)


  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    reset,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      tags: [],
    },
  })

  useEffect(() => {
    if (post) {
      reset({
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        tags: post.tags,
        coverImage: undefined, // Mantener como undefined para edición
      });
      setCoverImagePreview(post.coverImage);
    }
  }, [post, reset]);

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true)
      const fetchedPost = mockPosts.find((p) => p.id === Number.parseInt(resolvedParams.id))

      if (fetchedPost) {
        setPost(fetchedPost)
        reset({
          title: fetchedPost.title,
          excerpt: fetchedPost.excerpt,
          content: fetchedPost.content,
          tags: fetchedPost.tags,
        })
        setTags(fetchedPost.tags)
        setCoverImagePreview(fetchedPost.coverImage)
      } else {
        toast({
          title: "Error",
          description: "No se pudo encontrar el post",
          variant: "destructive",
        })
        router.push("/admin/posts")
      }
      setIsLoading(false)
    }

    fetchPost()
  }, [resolvedParams.id, reset, router, toast])

  const onSubmit = async (data: PostFormData, publish = false) => {
    if (!post) return;

    const updatedPost: Post = {
      ...post,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      tags: data.tags,
      coverImage: data.coverImage?.[0]
        ? URL.createObjectURL(data.coverImage[0])
        : post.coverImage,
      publishDate: publish ? new Date().toISOString() : post.publishDate,
    };

    // Lógica de actualización simulada
    console.log("Actualizando post:", updatedPost)

    toast({
      title: publish ? "Post publicado" : "Borrador guardado",
      description: publish ? "Tu post ha sido publicado exitosamente." : "Tu borrador ha sido guardado exitosamente.",
    })

    router.push("/admin/posts")
  }

  if (isLoading) {
    return <div>Cargando...</div>
  }

  if (!post) {
    return <div>No se encontró el post</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center">
            <FileText className="mr-2 h-8 w-8 text-primary" />
            Editar Post
          </h1>
          <Button onClick={() => router.back()} variant="outline">
            Cancelar
          </Button>
        </div>

        <form onSubmit={handleSubmit((data) => onSubmit(data, !post?.publishDate))} className="space-y-8">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-2">
                    Título
                  </label>
                  <Input
                    id="title"
                    {...register("title")}
                    className="w-full bg-secondary/50"
                    placeholder="Ingresa el título del post"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-destructive">{errors.title.message || "Error en el título"}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="excerpt" className="block text-sm font-medium mb-2">
                    Extracto
                  </label>
                  <Textarea
                    id="excerpt"
                    {...register("excerpt")}
                    className="w-full min-h-[100px] bg-secondary/50 resize-none"
                    placeholder="Escribe un breve extracto del post"
                  />
                  {errors.excerpt && (
                    <p className="mt-1 text-sm text-destructive">{errors.excerpt.message || "Error en el extracto"}</p>
                  )}
                </div>

                <ContentEditor control={control} error={errors.content?.message || ""} />

                <TagInput
                  tags={tags}
                  setTags={(newTags) => {
                    setTags(newTags)
                    setValue("tags", newTags)
                  }}
                  error={errors.tags?.message || ""}
                />

                <CoverImageUpload
                  coverImagePreview={coverImagePreview}
                  setCoverImagePreview={(preview) => {
                    setCoverImagePreview(preview);
                    if (!preview) setValue("coverImage", undefined);
                  }}
                  error={errors.coverImage?.message?.toString() || ""}
                  register={register}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" onClick={() => handleSubmit((data) => onSubmit(data, true))()}>
              Actualizar publicación
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}