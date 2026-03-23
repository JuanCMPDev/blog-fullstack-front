"use client"

import { useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useExam, useExamStatus, submitExamAttempt } from "@/hooks/use-exams"
import { ExamTaker } from "@/components/exams/ExamTaker"
import { ExamResult } from "@/components/exams/ExamResult"
import type { ExamAttemptResult, QuestionReview } from "@/lib/types"

export default function ExamPage() {
  const params = useParams<{ slug: string; examId: string }>()
  const router = useRouter()
  const { exam, isLoading: examLoading } = useExam(params.examId)
  const { status, isLoading: statusLoading, refresh: refreshStatus } = useExamStatus(params.examId)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<ExamAttemptResult | null>(null)
  const [review, setReview] = useState<QuestionReview[] | undefined>()
  const [startedAt] = useState(() => new Date().toISOString())

  const handleSubmit = useCallback(
    async (answers: Array<{ questionId: string; selectedIndex: number }>) => {
      if (!params.examId) return
      setIsSubmitting(true)
      try {
        const res = await submitExamAttempt(params.examId, answers, startedAt)
        setResult(res)
        refreshStatus()

        // Si puede ver review, obtener los intentos para tener el review
        if (res.canReviewAnswers) {
          try {
            const { customFetch } = await import("@/lib/customFetch")
            const { buildApiUrl } = await import("@/lib/api")
            const attemptsRes = await customFetch(
              buildApiUrl(`exams/${params.examId}/attempts`),
            )
            const attempts = await attemptsRes.json()
            // El primer intento es el más reciente
            if (Array.isArray(attempts) && attempts[0]?.review) {
              setReview(attempts[0].review)
            }
          } catch {
            // No es crítico si falla
          }
        }
      } catch {
        // Error manejado por submitExamAttempt
      } finally {
        setIsSubmitting(false)
      }
    },
    [params.examId, startedAt, refreshStatus],
  )

  const handleBackToCourse = () => {
    router.push(`/courses/${params.slug}`)
  }

  const handleRetry = () => {
    setResult(null)
    setReview(undefined)
    refreshStatus()
  }

  if (examLoading || statusLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Examen no encontrado</p>
        <Button variant="outline" className="mt-4" onClick={handleBackToCourse}>
          Volver al curso
        </Button>
      </div>
    )
  }

  // Si el examen está bloqueado y no hay resultado previo
  if (status && !status.unlocked && !result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground mb-4">
          Este examen no está disponible todavía.
        </p>
        <Button variant="outline" onClick={handleBackToCourse}>
          Volver al curso
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto px-3 sm:px-4 py-6 sm:py-8"
    >
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 gap-1 text-muted-foreground"
          onClick={handleBackToCourse}
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al curso
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">{exam.title}</h1>
        {exam.course && (
          <p className="text-sm text-muted-foreground mt-1">{exam.course.title}</p>
        )}
      </div>

      {/* Resultado o formulario */}
      {result ? (
        <ExamResult
          score={result.score}
          passed={result.passed}
          passingScore={exam.passingScore}
          canReviewAnswers={result.canReviewAnswers}
          review={review}
          onBackToCourse={handleBackToCourse}
          onRetry={handleRetry}
        />
      ) : (
        <ExamTaker
          questions={exam.questions}
          passingScore={exam.passingScore}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </motion.div>
  )
}
