"use client"

import { useCreatePost } from '@/hooks/use-create-post'
import CreatePostForm from '@/components/CreatePostForm'

export default function CreatePostPage() {
  const {
    register,
    handleSubmit,
    control,
    errors,
    setValue,
    slug,
    setSlug,
    coverImagePreview,
    setCoverImagePreview,
    tags,
    setTags,
    handleTitleChange,
    onSubmit,
  } = useCreatePost([])

  return (
    <CreatePostForm
      onSubmit={onSubmit}
      handleTitleChange={handleTitleChange}
      slug={slug}
      setSlug={setSlug}
      coverImagePreview={coverImagePreview}
      setCoverImagePreview={setCoverImagePreview}
      register={register}
      control={control}
      errors={errors}
      setValue={setValue}
      tags={tags}
      setTags={setTags}
      handleSubmit={handleSubmit}  // Aquí pasamos handleSubmit correctamente
    />
  )
}
