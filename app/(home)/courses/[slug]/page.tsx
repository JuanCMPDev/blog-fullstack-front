"use client"

import { useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useCourseBySlug, type CoursePost } from "@/hooks/use-courses"
import { useCourseProgress } from "@/hooks/use-course-progress"
import { useExamsStatus } from "@/hooks/use-exams"
import { useAuth } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Clock, ChevronRight, Loader2, FileText, CheckCircle2, Layers } from "lucide-react"
import { EmptyState } from "@/components/common/EmptyState"
import { ExamCard } from "@/components/courses/ExamCard"
import { ExamAttemptHistory } from "@/components/courses/ExamAttemptHistory"
import { motion } from "framer-motion"
import type { ExamStatus } from "@/lib/types"

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "Principiante",
  MEDIUM: "Intermedio",
  HARD: "Avanzado",
}

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  HARD: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { course, isLoading } = useCourseBySlug(slug)
  const { user } = useAuth()
  const { completedPostIds, percentage } = useCourseProgress(course?.id)
  const { statuses } = useExamsStatus(course?.id)

  // Map de status por examId para acceso rápido
  const statusMap = useMemo(() => {
    const map = new Map<string, ExamStatus>()
    statuses.forEach((s) => map.set(s.examId, s))
    return map
  }, [statuses])

  // Determinar si tenemos módulos (nueva estructura) o solo posts planos
  const hasModules = (course?.modules?.length ?? 0) > 0

  // Contar total de posts (desde módulos o plano)
  const totalPosts = useMemo(() => {
    if (hasModules && course?.modules) {
      return course.modules.reduce((acc, m) => acc + m.posts.length, 0)
    }
    return course?.posts?.length ?? 0
  }, [course, hasModules])

  const totalExams = useMemo(() => {
    if (hasModules && course?.modules) {
      return course.modules.filter((m) => m.exam).length
    }
    return 0
  }, [course, hasModules])

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="container max-w-4xl px-4 py-20 mx-auto">
        <EmptyState
          icon={BookOpen}
          title="Curso no encontrado"
          description="El curso que buscas no existe o fue eliminado."
          action={{ label: "Ver todos los cursos", href: "/courses" }}
        />
      </div>
    )
  }

  const isCompleted = percentage === 100 && user

  return (
    <div className="container max-w-4xl px-4 py-8 mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Link href="/courses" className="hover:underline">Cursos</Link>
            <ChevronRight className="h-3 w-3" />
            <span>{course.title}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 shrink-0" />
                <span className="break-words">{course.title}</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">{course.description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isCompleted && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Completado
                </Badge>
              )}
              <Badge className={DIFFICULTY_COLORS[course.difficulty] || ""} variant="secondary">
                {DIFFICULTY_LABELS[course.difficulty] || course.difficulty}
              </Badge>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {user && percentage > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-muted-foreground">Progreso del curso</span>
              <span className="font-medium text-primary">{percentage}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Content: Modules or flat posts */}
        {totalPosts > 0 ? (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold mb-4">
              Contenido ({totalPosts} post{totalPosts !== 1 ? "s" : ""}
              {totalExams > 0 && `, ${totalExams} examen${totalExams !== 1 ? "es" : ""}`})
            </h2>

            {hasModules && course.modules ? (
              /* ── Render by modules ── */
              <div className="space-y-6">
                {course.modules.map((mod, modIdx) => (
                  <motion.div
                    key={mod.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: modIdx * 0.08 }}
                  >
                    {/* Module header */}
                    <div className="flex items-center gap-2 mb-3">
                      <Layers className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">
                        {mod.title}
                      </h3>
                      <div className="flex-1 h-px bg-border/50" />
                    </div>

                    {/* Posts in module */}
                    <div className="space-y-3">
                      {mod.posts.map((post: CoursePost, postIdx: number) => {
                        const isDone = completedPostIds.includes(post.id)
                        return (
                          <Link key={post.id} href={`/post/${post.slug}`}>
                            <Card className="glass-card border-border/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200">
                              <CardContent className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4">
                                {isDone ? (
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10 shrink-0">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                                    {postIdx + 1}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{post.title}</p>
                                  <p className="text-sm text-muted-foreground truncate">{post.excerpt}</p>
                                </div>
                                <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                                  <Clock className="h-3 w-3" />
                                  {post.readTime} min
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 hidden xs:block" />
                              </CardContent>
                            </Card>
                          </Link>
                        )
                      })}

                      {/* Exam for this module */}
                      {mod.exam && (
                        <div className="mt-2">
                          <ExamCard
                            exam={mod.exam}
                            status={statusMap.get(mod.exam.id)}
                            onStart={() =>
                              router.push(`/courses/${slug}/exam/${mod.exam!.id}`)
                            }
                          />
                          {user &&
                            statusMap.get(mod.exam.id)?.attemptCount &&
                            statusMap.get(mod.exam.id)!.attemptCount > 0 && (
                              <ExamAttemptHistory examId={mod.exam.id} />
                            )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* ── Fallback: flat post list (no modules) ── */
              course.posts?.map((post: CoursePost, index: number) => {
                const isDone = completedPostIds.includes(post.id)
                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <Link href={`/post/${post.slug}`}>
                      <Card className="glass-card border-border/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200">
                        <CardContent className="flex items-center gap-4 p-4">
                          {isDone ? (
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10 shrink-0">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                              {post.courseOrder ?? index + 1}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{post.title}</p>
                            <p className="text-sm text-muted-foreground truncate">{post.excerpt}</p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                            <Clock className="h-3 w-3" />
                            {post.readTime} min
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                )
              })
            )}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="Este curso aún no tiene posts publicados"
            description="El contenido de este curso está en preparación."
          />
        )}
      </motion.div>
    </div>
  )
}
