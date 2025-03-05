import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ContentEditor } from '@/components/admin/ContentEditor'
import { TagInput } from '@/components/admin/TagInput'
import { CoverImageUpload } from '@/components/admin/CoverImageUpload'
import { Card, CardContent } from './ui/card'
import { useRouter } from 'next/navigation'

interface CreatePostFormProps {
  onSubmit: (data: any, isDraft?: boolean) => void;
  handleTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  slug: string;
  setSlug: React.Dispatch<React.SetStateAction<string>>;
  coverImagePreview: string | null;
  setCoverImagePreview: React.Dispatch<React.SetStateAction<string | null>>;
  handleSubmit: (fn: (data: any) => void) => (e: React.FormEvent<HTMLFormElement>) => void;
  register: any;
  control: any;
  errors: any;
  setValue: any;
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
}

const CreatePostForm = ({
  onSubmit,
  handleTitleChange,
  slug,
  setSlug,
  coverImagePreview,
  setCoverImagePreview,
  handleSubmit,
  register,
  control,
  errors,
  setValue,
  tags,
  setTags
}: CreatePostFormProps) => {
  const router = useRouter()

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center">
            <FileText className="mr-2 h-8 w-8 text-primary" />
            Crear Nuevo Post
          </h1>
          <Button variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>

        {/* Reemplazar Form con un formulario estándar */}
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
                    {...register('title')}
                    className="w-full bg-secondary/50"
                    placeholder="Ingresa el título del post"
                    onChange={handleTitleChange}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-destructive">{errors.title.message || 'Error en el título'}</p>
                  )}
                </div>

                {/* Campo de Slug */}
                <div>
                  <label htmlFor="slug" className="block text-sm font-medium mb-2">
                    Slug (URL)
                  </label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)} // Permitir modificación manual del slug
                    className="w-full bg-secondary/50"
                    placeholder="Slug del post"
                  />
                  {errors.slug && (
                    <p className="mt-1 text-sm text-destructive">{errors.slug.message || 'Error en el slug'}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="excerpt" className="block text-sm font-medium mb-2">
                    Extracto
                  </label>
                  <Textarea
                    id="excerpt"
                    {...register('excerpt')}
                    className="w-full min-h-[100px] bg-secondary/50 resize-none"
                    placeholder="Escribe un breve extracto del post"
                  />
                  {errors.excerpt && (
                    <p className="mt-1 text-sm text-destructive">{errors.excerpt.message || 'Error en el extracto'}</p>
                  )}
                </div>

                <ContentEditor control={control} error={errors.content?.message || ''} />

                <TagInput
                  tags={tags}
                  setTags={(newTags) => {
                    setTags(newTags)
                    setValue('tags', newTags)
                  }}
                  error={errors.tags?.message || ''}
                />

                <CoverImageUpload
                  coverImagePreview={coverImagePreview}
                  setCoverImagePreview={setCoverImagePreview}
                  error={errors.coverImage?.message?.toString() || ''}
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

export default CreatePostForm
