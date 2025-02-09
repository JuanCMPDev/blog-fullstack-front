"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth"
import { Card, CardContent } from "@/components/ui/card"
import { ContentEditor } from "@/components/admin/ContentEditor"
import { TagInput } from "@/components/admin/TagInput"
import { CoverImageUpload } from "@/components/admin/CoverImageUpload"
import { postSchema, type PostFormData, type Post } from "@/lib/types"

export default function CreatePostPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      tags: [],
    },
  })

  const onSubmit = async (data: PostFormData, isDraft = false) => {
    // Here you would typically send the data to your backend
    console.log("Form data:", data)

    const newPost: Post = {
      id: Math.floor(Math.random() * 1000),
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      image: coverImagePreview || "/placeholder.svg",
      tags: data.tags,
      likes: 0,
      comments: 0,
      author: {
        id: user?.id || "unknown",
        name: user?.name || "Unknown Author",
        avatar: user?.avatar || "/placeholder-user.jpg",
      },
      coverImage: coverImagePreview || "/placeholder.svg",
      date: new Date().toISOString(),
      publishDate: isDraft ? null : new Date().toISOString(),
      readTime: Math.ceil(data.content.split(" ").length / 200),
    }

    toast({
      title: isDraft ? "Borrador guardado" : "Post creado",
      description: isDraft ? "Tu borrador ha sido guardado exitosamente." : "Tu post ha sido creado exitosamente.",
    })

    router.push(`/post/${newPost.id}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center">
            <FileText className="mr-2 h-8 w-8 text-primary" />
            Crear Nuevo Post
          </h1>
          <Button onClick={() => router.back()} variant="outline">
            Cancelar
          </Button>
        </div>

        <form onSubmit={handleSubmit((data) => onSubmit(data, false))} className="space-y-8">
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
                  setCoverImagePreview={setCoverImagePreview}
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
            <Button type="button" variant="secondary" onClick={handleSubmit((data) => onSubmit(data, true))}>
              Guardar como borrador
            </Button>
            <Button type="submit">Publicar Post</Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

