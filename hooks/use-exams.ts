import { useState, useEffect, useCallback } from "react"
import { customFetch } from "@/lib/customFetch"
import { buildApiUrl } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import type { Exam, ExamStatus, ExamAttempt, ExamAttemptResult } from "@/lib/types"

// ── Exámenes de un curso ──

export function useExamsForCourse(courseId: string | null | undefined) {
  const [exams, setExams] = useState<Exam[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!courseId) return
    let cancelled = false
    setIsLoading(true)

    customFetch(buildApiUrl(`exams/course/${courseId}`))
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setExams(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!cancelled) setExams([])
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [courseId])

  return { exams, isLoading }
}

// ── Status de exámenes (requiere auth) ──

export function useExamsStatus(courseId: string | null | undefined) {
  const [statuses, setStatuses] = useState<ExamStatus[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  const refresh = useCallback(() => {
    if (!courseId || !user) return
    setIsLoading(true)

    customFetch(buildApiUrl(`exams/course/${courseId}/status`))
      .then((res) => res.json())
      .then((data) => setStatuses(Array.isArray(data) ? data : []))
      .catch(() => setStatuses([]))
      .finally(() => setIsLoading(false))
  }, [courseId, user])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { statuses, isLoading, refresh }
}

// ── Examen individual (sin correctIndex) ──

export function useExam(examId: string | null | undefined) {
  const [exam, setExam] = useState<Exam | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!examId) return
    let cancelled = false
    setIsLoading(true)

    customFetch(buildApiUrl(`exams/${examId}`))
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

// ── Status de un examen individual ──

export function useExamStatus(examId: string | null | undefined) {
  const [status, setStatus] = useState<ExamStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const refresh = useCallback(() => {
    if (!examId) return
    setIsLoading(true)

    customFetch(buildApiUrl(`exams/${examId}/status`))
      .then((res) => res.json())
      .then((data) => setStatus(data))
      .catch(() => setStatus(null))
      .finally(() => setIsLoading(false))
  }, [examId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { status, isLoading, refresh }
}

// ── Historial de intentos ──

export function useExamAttempts(examId: string | null | undefined) {
  const [attempts, setAttempts] = useState<ExamAttempt[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  const refresh = useCallback(() => {
    if (!examId || !user) return
    setIsLoading(true)

    customFetch(buildApiUrl(`exams/${examId}/attempts`))
      .then((res) => res.json())
      .then((data) => setAttempts(Array.isArray(data) ? data : []))
      .catch(() => setAttempts([]))
      .finally(() => setIsLoading(false))
  }, [examId, user])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { attempts, isLoading, refresh }
}

// ── Submit de intento ──

export async function submitExamAttempt(
  examId: string,
  answers: Array<{ questionId: string; selectedIndex: number }>,
  startedAt: string,
): Promise<ExamAttemptResult> {
  const res = await customFetch(buildApiUrl(`exams/${examId}/submit`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers, startedAt }),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || "Error al enviar examen")
  }

  return res.json()
}
