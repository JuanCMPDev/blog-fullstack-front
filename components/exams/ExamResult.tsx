"use client"

import { Trophy, XCircle, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { QuestionReview } from "@/lib/types"

interface ExamResultProps {
  score: number
  passed: boolean
  passingScore: number
  canReviewAnswers: boolean
  review?: QuestionReview[]
  onBackToCourse: () => void
  onRetry?: () => void
}

export function ExamResult({
  score,
  passed,
  passingScore,
  canReviewAnswers,
  review,
  onBackToCourse,
  onRetry,
}: ExamResultProps) {
  const optionLetters = ["A", "B", "C", "D", "E", "F", "G", "H"]

  return (
    <div className="space-y-6">
      {/* Score hero */}
      <div
        className={`rounded-2xl p-6 sm:p-8 text-center ${
          passed
            ? "bg-green-500/10 border border-green-500/30"
            : "bg-red-500/10 border border-red-500/30"
        }`}
      >
        <div
          className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            passed ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
          }`}
        >
          {passed ? <Trophy className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
        </div>

        <h2 className="text-3xl font-bold mb-1">{score}%</h2>
        <p
          className={`text-sm font-medium ${
            passed ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          }`}
        >
          {passed ? "Aprobado" : "No aprobado"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Umbral de aprobación: {passingScore}%
        </p>
      </div>

      {/* Review */}
      {canReviewAnswers && review && review.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Revisión de respuestas</h3>
          {review.map((q, i) => (
            <div
              key={q.questionId}
              className={`rounded-lg border p-3 sm:p-4 ${
                q.isCorrect ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"
              }`}
            >
              <div className="flex items-start gap-2 mb-2">
                <span
                  className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                    q.isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white"
                  }`}
                >
                  {q.isCorrect ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                </span>
                <p className="text-sm font-medium">
                  {i + 1}. {q.text}
                </p>
              </div>
              <div className="ml-5 sm:ml-7 space-y-1">
                {q.options.map((opt, oIdx) => {
                  const isCorrect = oIdx === q.correctIndex
                  const isSelected = oIdx === q.selectedIndex
                  return (
                    <div
                      key={oIdx}
                      className={`text-xs px-2 py-1 rounded ${
                        isCorrect
                          ? "text-green-700 dark:text-green-300 font-medium"
                          : isSelected && !isCorrect
                          ? "text-red-700 dark:text-red-300 line-through"
                          : "text-muted-foreground"
                      }`}
                    >
                      {optionLetters[oIdx]}. {opt}
                      {isCorrect && " (correcta)"}
                      {isSelected && !isCorrect && " (tu respuesta)"}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {!canReviewAnswers && (
        <p className="text-sm text-muted-foreground text-center">
          La revisión de respuestas estará disponible cuando apruebes el examen o tras 3 intentos.
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center pt-4">
        <Button variant="outline" onClick={onBackToCourse} className="w-full sm:w-auto">
          Volver al curso
        </Button>
        {onRetry && (
          <Button onClick={onRetry} className="w-full sm:w-auto">
            Intentar de nuevo
          </Button>
        )}
      </div>
    </div>
  )
}
