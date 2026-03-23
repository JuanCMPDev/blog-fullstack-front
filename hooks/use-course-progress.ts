"use client"

import { useState, useEffect, useCallback } from "react"
import { customFetch } from "@/lib/customFetch"
import { buildApiUrl } from "@/lib/api"
import { useAuth } from "@/lib/auth"

// ── Types ───────────────────────────────────────────────────────────

export interface CourseProgressData {
  completedPostIds: number[]
  total: number
  completed: number
  percentage: number
}

export interface MyCourseProgress {
  courseId: string
  courseTitle: string
  courseSlug: string
  difficulty: "EASY" | "MEDIUM" | "HARD"
  total: number
  completed: number
  percentage: number
}

// ── Fire-and-forget: mark post as completed ─────────────────────────

export async function markPostCompleted(postId: number): Promise<void> {
  const { accessToken } = useAuth.getState()
  if (!accessToken) return

  try {
    await customFetch(buildApiUrl(`courses/progress/${postId}`), {
      method: "POST",
    })
  } catch {
    // Non-blocking — errors are silently ignored
  }
}

// ── Hook: progress for a specific course ────────────────────────────

export function useCourseProgress(courseId: string | undefined) {
  const { user } = useAuth()
  const [data, setData] = useState<CourseProgressData>({
    completedPostIds: [],
    total: 0,
    completed: 0,
    percentage: 0,
  })
  const [isLoading, setIsLoading] = useState(false)

  const fetch_ = useCallback(async () => {
    if (!courseId || !user) return

    setIsLoading(true)
    try {
      const res = await customFetch(buildApiUrl(`courses/${courseId}/progress`))
      if (res.ok) {
        const json: CourseProgressData = await res.json()
        setData(json)
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false)
    }
  }, [courseId, user])

  useEffect(() => {
    fetch_()
  }, [fetch_])

  return { ...data, isLoading, refresh: fetch_ }
}

// ── Hook: all courses the user has started ──────────────────────────

export function useMyCoursesProgress() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<MyCourseProgress[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      setCourses([])
      return
    }

    let cancelled = false
    setIsLoading(true)

    customFetch(buildApiUrl("courses/my-progress"))
      .then(async (res) => {
        if (res.ok && !cancelled) {
          const json: MyCourseProgress[] = await res.json()
          setCourses(json)
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user])

  return { courses, isLoading }
}
