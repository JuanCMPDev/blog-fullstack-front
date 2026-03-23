"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { useMyCoursesProgress } from "@/hooks/use-course-progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { GraduationCap, ChevronRight } from "lucide-react"
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

export function ContinueLearning() {
  const { user } = useAuth()
  const { courses, isLoading } = useMyCoursesProgress()

  // Only show courses that are in progress (not completed, not unstarted)
  const inProgressCourses = courses.filter(c => c.percentage > 0 && c.percentage < 100)

  if (!user || isLoading || inProgressCourses.length === 0) return null

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm font-medium text-primary mb-1">Tu progreso</p>
          <h2 className="text-2xl font-headline font-bold tracking-tight flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            Continúa tu aprendizaje
          </h2>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {inProgressCourses.map((course, i) => {
          return (
            <motion.div
              key={course.courseId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
            >
              <Link href={`/courses/${course.courseSlug}`}>
                <Card className="group glass-card hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 h-full border-border/30">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-headline font-semibold group-hover:text-primary transition-colors line-clamp-1">
                        {course.courseTitle}
                      </h3>
                      <Badge
                        className={`${DIFFICULTY_COLORS[course.difficulty] || ""} text-[10px] shrink-0`}
                        variant="secondary"
                      >
                        {DIFFICULTY_LABELS[course.difficulty] || course.difficulty}
                      </Badge>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-2">
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${course.percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {course.completed} de {course.total} posts
                      </span>
                      <span className="text-xs font-medium text-primary">
                        {course.percentage}%
                      </span>
                    </div>

                    <div className="flex items-center justify-end mt-2">
                      <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-0.5">
                        Continuar
                        <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
