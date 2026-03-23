import { useState, useEffect } from "react"
import { customFetch } from "@/lib/customFetch"
import { buildApiUrl } from "@/lib/api"
import type { Exam } from "@/lib/types"

export function useAdminExam(examId: string | null | undefined) {
  const [exam, setExam] = useState<Exam | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!examId) return
    let cancelled = false
    setIsLoading(true)

    customFetch(buildApiUrl(`exams/${examId}/admin`))
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setExam(data)
      })
      .catch(() => {
        if (!cancelled) setExam(null)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [examId])

  return { exam, isLoading }
}

export async function createExam(dto: {
  title: string
  courseId: string
  moduleOrder: number
  passingScore?: number
  cooldownHours?: number
  questions: Array<{
    text: string
    options: string[]
    correctIndex: number
    order: number
  }>
}): Promise<Exam> {
  const res = await customFetch(buildApiUrl("exams"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || "Error al crear examen")
  }
  return res.json()
}

export async function updateExam(
  examId: string,
  dto: Partial<Parameters<typeof createExam>[0]>,
): Promise<Exam> {
  const res = await customFetch(buildApiUrl(`exams/${examId}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || "Error al actualizar examen")
  }
  return res.json()
}

export async function deleteExam(examId: string): Promise<void> {
  const res = await customFetch(buildApiUrl(`exams/${examId}`), {
    method: "DELETE",
  })
  if (!res.ok) {
    throw new Error("Error al eliminar examen")
  }
}
