export type CreatePostStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED'

interface BuildCreatePostFormDataInput {
  title: string
  slug: string
  excerpt: string
  content: string
  contentV2?: string
  tags?: string[]
  status: CreatePostStatus
  publishDate?: string
  image?: File | null
  imageFileName?: string
  courseId?: string | null
  courseOrder?: number | null
}

export function buildCreatePostFormData(input: BuildCreatePostFormDataInput): FormData {
  const formData = new FormData()

  formData.append('title', input.title)
  formData.append('slug', input.slug)
  formData.append('excerpt', input.excerpt)
  formData.append('content', input.content)

  if (input.contentV2 && input.contentV2.trim().length > 0) {
    formData.append('contentV2', input.contentV2)
  }

  formData.append('status', input.status)

  if (Array.isArray(input.tags) && input.tags.length > 0) {
    input.tags.forEach((tag) => formData.append('tags', tag))
  }

  if (input.publishDate && input.status !== 'DRAFT') {
    formData.append('publishDate', input.publishDate)
  }

  if (input.image) {
    if (input.imageFileName) {
      formData.append('image', input.image, input.imageFileName)
    } else {
      formData.append('image', input.image)
    }
  }

  if (input.courseId) {
    formData.append('courseId', input.courseId)
    if (input.courseOrder != null) {
      formData.append('courseOrder', input.courseOrder.toString())
    }
  }

  return formData
}
