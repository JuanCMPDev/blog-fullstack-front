import { useState, useEffect, useCallback } from "react"
import { customFetch } from "@/lib/customFetch"
import { buildApiUrl } from "@/lib/api"

export interface ModuleWithDetails {
  id: string
  title: string
  order: number
  courseId: string
  posts: Array<{
    id: number
    title: string
    slug: string
    courseOrder: number | null
    status?: string
  }>
  exam: {
    id: string
    title: string
    passingScore: number
    _count?: { questions: number }
  } | null
  createdAt: string
}

export function useModulesForCourse(courseId: string | null | undefined) {
  const [modules, setModules] = useState<ModuleWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const refresh = useCallback(() => {
    if (!courseId) return
    setIsLoading(true)

    customFetch(buildApiUrl(`courses/${courseId}/modules`))
      .then((res) => res.json())
      .then((data) => setModules(Array.isArray(data) ? data : []))
      .catch(() => setModules([]))
      .finally(() => setIsLoading(false))
  }, [courseId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { modules, isLoading, refresh }
}

export async function createModule(
  courseId: string,
  dto: { title: string; order: number },
) {
  const res = await customFetch(buildApiUrl(`courses/${courseId}/modules`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || "Error al crear módulo")
  }
  return res.json()
}

export async function updateModule(
  moduleId: string,
  dto: { title?: string; order?: number },
) {
  const res = await customFetch(buildApiUrl(`courses/modules/${moduleId}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || "Error al actualizar módulo")
  }
  return res.json()
}

export async function deleteModule(moduleId: string) {
  const res = await customFetch(buildApiUrl(`courses/modules/${moduleId}`), {
    method: "DELETE",
  })
  if (!res.ok) {
    throw new Error("Error al eliminar módulo")
  }
}
