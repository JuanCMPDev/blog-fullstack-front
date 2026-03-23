"use client"

import { useState, useEffect, useCallback } from "react"
import { customFetch } from "@/lib/customFetch"
import { buildApiUrl } from "@/lib/api"

export interface Course {
  id: string
  title: string
  slug: string
  description: string
  coverImage: string | null
  difficulty: "EASY" | "MEDIUM" | "HARD"
  createdAt: string
  updatedAt: string
  _count?: { posts: number }
  posts?: CoursePost[]
  modules?: CourseModule[]
}

export interface CourseModule {
  id: string
  title: string
  order: number
  courseId: string
  posts: CoursePost[]
  exam?: {
    id: string
    title: string
    passingScore: number
    cooldownHours: number
    moduleOrder: number
    questions: { id: string; text: string; options: string[]; order: number }[]
    _count?: { questions: number; attempts: number }
  } | null
  createdAt: string
}

export interface CoursePost {
  id: number
  title: string
  slug: string
  excerpt: string
  coverImage: string | null
  courseOrder: number | null
  readTime: number
  status?: string
  tags?: string[]
  publishDate?: string
}

export interface CreateCourseInput {
  title: string
  slug: string
  description: string
  coverImage?: string
  difficulty?: "EASY" | "MEDIUM" | "HARD"
}

export interface SeriesNavigation {
  course: { id: string; title: string; slug: string } | null
  prev: { id: number; title: string; slug: string; courseOrder: number } | null
  next: { id: number; title: string; slug: string; courseOrder: number } | null
}

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchCourses = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await customFetch(buildApiUrl("courses"))
      if (res.ok) {
        setCourses(await res.json())
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const createCourse = async (data: CreateCourseInput) => {
    const res = await customFetch(buildApiUrl("courses"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || "Error al crear el curso")
    }
    const created = await res.json()
    setCourses((prev) => [created, ...prev])
    return created
  }

  const updateCourse = async (id: string, data: Partial<CreateCourseInput>) => {
    const res = await customFetch(buildApiUrl(`courses/${id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || "Error al actualizar el curso")
    }
    const updated = await res.json()
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)))
    return updated
  }

  const deleteCourse = async (id: string) => {
    const res = await customFetch(buildApiUrl(`courses/${id}`), {
      method: "DELETE",
    })
    if (!res.ok) throw new Error("Error al eliminar el curso")
    setCourses((prev) => prev.filter((c) => c.id !== id))
  }

  return { courses, isLoading, fetchCourses, createCourse, updateCourse, deleteCourse }
}

export function useCourseBySlug(slug: string) {
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    setIsLoading(true)
    fetch(buildApiUrl(`courses/${slug}`))
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setCourse(data))
      .catch(() => setCourse(null))
      .finally(() => setIsLoading(false))
  }, [slug])

  return { course, isLoading }
}

export function useSeriesNavigation(postId: number | undefined) {
  const [navigation, setNavigation] = useState<SeriesNavigation | null>(null)

  useEffect(() => {
    if (!postId) return
    fetch(buildApiUrl(`courses/navigation/${postId}`))
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setNavigation(data))
      .catch(() => setNavigation(null))
  }, [postId])

  return navigation
}
