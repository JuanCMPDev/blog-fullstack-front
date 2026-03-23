"use client"

import Link from "next/link"
import { useCourses } from "@/hooks/use-courses"
import { useExamsForCourse } from "@/hooks/use-exams"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ClipboardCheck,
  BookOpen,
  Plus,
  ChevronRight,
  Loader2,
} from "lucide-react"

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

function CourseExamsRow({ courseId, courseTitle, courseSlug, difficulty, postCount }: {
  courseId: string
  courseTitle: string
  courseSlug: string
  difficulty: string
  postCount: number
}) {
  const { exams, isLoading } = useExamsForCourse(courseId)

  return (
    <Card className="border-border/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{courseTitle}</CardTitle>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                <span>{postCount} post{postCount !== 1 ? "s" : ""}</span>
                <span>·</span>
                <Badge className={`${DIFFICULTY_COLORS[difficulty] || ""} text-[10px] px-1.5 py-0`} variant="secondary">
                  {DIFFICULTY_LABELS[difficulty] || difficulty}
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild className="gap-1">
            <Link href={`/admin/courses/${courseId}/exams`}>
              <Plus className="h-3.5 w-3.5" />
              Gestionar
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : exams.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2 pl-[52px]">
            Sin exámenes.
            <Link href={`/admin/courses/${courseId}/exams`} className="text-primary hover:underline ml-1">
              Crear el primero
            </Link>
          </p>
        ) : (
          <div className="space-y-2 pl-[52px]">
            {exams.map((exam) => (
              <Link
                key={exam.id}
                href={`/admin/courses/${courseId}/exams`}
                className="flex items-center justify-between rounded-lg border border-border/30 px-3 py-2 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <ClipboardCheck className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm font-medium truncate">{exam.title}</span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    Módulo {exam.moduleOrder}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {exam._count?.questions ?? 0} preg. · {exam.passingScore}%
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function AdminExamsPage() {
  const { courses, isLoading } = useCourses()

  return (
    <main className="space-y-6 p-4 sm:p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ClipboardCheck className="h-7 w-7" />
          Exámenes
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gestiona los exámenes de cada curso
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No hay cursos todavía. Crea un curso primero.</p>
          <Button variant="outline" asChild className="mt-4">
            <Link href="/admin/courses">Ir a Cursos</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <CourseExamsRow
              key={course.id}
              courseId={course.id}
              courseTitle={course.title}
              courseSlug={course.slug}
              difficulty={course.difficulty}
              postCount={course._count?.posts ?? 0}
            />
          ))}
        </div>
      )}
    </main>
  )
}
