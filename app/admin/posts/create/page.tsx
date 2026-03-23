"use client"

import { useCreatePost } from '@/hooks/use-create-post'
import CreatePostForm from '@/components/blog/CreatePostForm'

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
    setCoverImageFile,
    tags,
    setTags,
    handleTitleChange,
    onSubmit,
    courseId,
    setCourseId,
    courseOrder,
    setCourseOrder,
  } = useCreatePost([])

  return (
    <CreatePostForm
      onSubmit={onSubmit}
      handleTitleChange={handleTitleChange}
      slug={slug}
      setSlug={setSlug}
      coverImagePreview={coverImagePreview}
      setCoverImagePreview={setCoverImagePreview}
      setCoverImageFile={setCoverImageFile}
      register={register}
      control={control}
      errors={errors}
      setValue={setValue}
      tags={tags}
      setTags={setTags}
      handleSubmit={handleSubmit}
      courseId={courseId}
      courseOrder={courseOrder}
      onCourseChange={(id, order) => { setCourseId(id); setCourseOrder(order); }}
    />
  )
}
