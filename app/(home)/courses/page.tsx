"use client"

import { useCourses } from "@/hooks/use-courses"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { BookOpen, FileText, Loader2, ArrowUpRight, Layers, Clock } from "lucide-react"
import { EmptyState } from "@/components/common/EmptyState"
import { motion } from "framer-motion"
import { getAvatarUrl } from "@/lib/utils"

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

export default function CoursesPage() {
  const { courses, isLoading } = useCourses()

  // Si hay solo 1 curso, usar layout de card grande. Si hay varios, grid.
  const isSingle = courses.length === 1

  return (
    <div className="relative min-h-screen overflow-hidden bg-dot-pattern">
      {/* Background orbs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-24 right-[-8rem] h-[30rem] w-[30rem] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute top-[35%] left-[-10rem] h-[26rem] w-[26rem] rounded-full bg-secondary/40 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[20%] h-[18rem] w-[18rem] rounded-full bg-primary/10 blur-2xl" />
      </div>

      {/* Hero section */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-primary">Aprendizaje</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-headline font-extrabold tracking-tight mb-4">
              Nuestros{" "}
              <span className="text-primary">Cursos</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Series de posts organizados para aprender paso a paso.
              Desde nivel principiante hasta avanzado, cada curso está diseñado para
              que domines un tema a tu ritmo.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="relative z-10 container max-w-5xl mx-auto px-4 pb-16 md:pb-24">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : courses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Próximamente habrá cursos disponibles"
            description="Estamos preparando contenido de calidad. ¡Vuelve pronto!"
            action={{ label: "Volver al inicio", href: "/" }}
          />
        ) : isSingle ? (
          /* ── Single course: featured card layout ── */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link href={`/courses/${courses[0].slug}`}>
              <div className="group glass-card rounded-2xl hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 border border-border/30 transition-all duration-300 overflow-hidden">
                {/* Cover image */}
                <div className="relative h-56 sm:h-72 md:h-80 w-full bg-gradient-to-br from-primary/20 via-primary/5 to-secondary/20 overflow-hidden">
                  {courses[0].coverImage ? (
                    <Image
                      src={getAvatarUrl(courses[0].coverImage) ?? ""}
                      alt={courses[0].title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="h-20 w-20 text-primary/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5">
                    <Badge className={`${DIFFICULTY_COLORS[courses[0].difficulty] || ""} text-xs`} variant="secondary">
                      {DIFFICULTY_LABELS[courses[0].difficulty] || courses[0].difficulty}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-headline font-bold text-2xl sm:text-3xl group-hover:text-primary transition-colors mb-3">
                        {courses[0].title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed mb-6 text-base">
                        {courses[0].description}
                      </p>
                    </div>
                    <ArrowUpRight className="h-6 w-6 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-200 shrink-0 mt-1" />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-4 border-t border-border/20">
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                      <FileText className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                      <span>{courses[0]._count?.posts ?? 0} lecciones</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                      <Layers className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                      <span>Curso completo</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                      <Clock className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                      <span>A tu ritmo</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ) : (
          /* ── Multiple courses: grid layout ── */
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            {courses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/courses/${course.slug}`}>
                  <div className="group glass-card rounded-2xl hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 border border-border/30 transition-all duration-300 h-full overflow-hidden">
                    {/* Cover image */}
                    <div className="relative h-40 sm:h-48 w-full bg-gradient-to-br from-primary/20 via-primary/5 to-secondary/20 overflow-hidden">
                      {course.coverImage ? (
                        <Image
                          src={getAvatarUrl(course.coverImage) ?? ""}
                          alt={course.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="h-14 w-14 text-primary/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-4">
                        <Badge className={`${DIFFICULTY_COLORS[course.difficulty] || ""} text-[10px]`} variant="secondary">
                          {DIFFICULTY_LABELS[course.difficulty] || course.difficulty}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-headline font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">
                          {course.title}
                        </h3>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 shrink-0 mt-0.5" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                      <div className="flex items-center gap-3 pt-3 border-t border-border/20">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <FileText className="h-3.5 w-3.5" />
                          <span>{course._count?.posts ?? 0} lecciones</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>A tu ritmo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
