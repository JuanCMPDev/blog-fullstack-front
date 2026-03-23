"use client"

import Link from "next/link"
import { useCourses } from "@/hooks/use-courses"
import { useMyCoursesProgress } from "@/hooks/use-course-progress"
import { useAuth } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, FileText, ChevronRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "Principiante",
  MEDIUM: "Intermedio",
  HARD: "Avanzado",
}

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
  HARD: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
}

export function FeaturedCourses() {
  const { courses, isLoading } = useCourses()
  const { user } = useAuth()
  const { courses: progressData } = useMyCoursesProgress()

  // IDs of courses that are in progress (shown in ContinueLearning instead)
  const inProgressIds = new Set(
    user
      ? progressData.filter(p => p.percentage > 0 && p.percentage < 100).map(p => p.courseId)
      : []
  )

  // Exclude in-progress courses to avoid duplication with ContinueLearning
  const visibleCourses = courses.filter(c => !inProgressIds.has(c.id))

  // Don't render if no courses to show
  if (!isLoading && visibleCourses.length === 0) return null

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm font-medium text-primary mb-1">Cursos Destacados</p>
          <h2 className="text-2xl font-headline font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Domina la instrumentación de la web moderna.
          </h2>
        </div>
        <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
          <Link href="/courses" className="flex items-center gap-1">
            Ver todos
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCourses.slice(0, 3).map((course, i) => {
            const progress = user
              ? progressData.find(p => p.courseId === course.id)
              : undefined

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
              >
                <Link href={`/courses/${course.slug}`}>
                  <Card className="group glass-card hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 h-full border-border/30">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="font-headline font-semibold group-hover:text-primary transition-colors line-clamp-1">
                          {course.title}
                        </h3>
                        <Badge
                          className={`${DIFFICULTY_COLORS[course.difficulty] || ""} text-[10px] shrink-0`}
                          variant="secondary"
                        >
                          {DIFFICULTY_LABELS[course.difficulty] || course.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {course.description}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        {course._count?.posts ?? 0} post{(course._count?.posts ?? 0) !== 1 ? "s" : ""}
                      </div>

                      {/* Completed badge for courses the user finished */}
                      {progress && progress.percentage === 100 && (
                        <div className="mt-3 pt-3 border-t border-border/20">
                          <span className="text-[10px] text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Curso completado
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}

      <div className="mt-4 text-center sm:hidden">
        <Button variant="outline" size="sm" asChild>
          <Link href="/courses">Ver todos los cursos</Link>
        </Button>
      </div>
    </section>
  )
}
