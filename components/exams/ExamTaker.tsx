"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import type { ExamQuestion } from "@/lib/types"

interface ExamTakerProps {
  questions: ExamQuestion[]
  passingScore: number
  onSubmit: (answers: Array<{ questionId: string; selectedIndex: number }>) => Promise<void>
  isSubmitting: boolean
}

export function ExamTaker({ questions, passingScore, onSubmit, isSubmitting }: ExamTakerProps) {
  const [answers, setAnswers] = useState<Map<string, number>>(new Map())
  const sorted = [...questions].sort((a, b) => a.order - b.order)
  const allAnswered = sorted.every((q) => answers.has(q.id))

  const selectAnswer = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => {
      const next = new Map(prev)
      next.set(questionId, optionIndex)
      return next
    })
  }

  const handleSubmit = () => {
    const payload = sorted.map((q) => ({
      questionId: q.id,
      selectedIndex: answers.get(q.id) ?? -1,
    }))
    onSubmit(payload)
  }

  const optionLetters = ["A", "B", "C", "D", "E", "F", "G", "H"]

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        Responde todas las preguntas. Necesitas {passingScore}% para aprobar.
      </div>

      {sorted.map((q, qIndex) => {
        const selected = answers.get(q.id)

        return (
          <div key={q.id} className="rounded-xl border border-border p-3 sm:p-5 space-y-3">
            <p className="font-medium text-sm sm:text-base">
              <span className="text-primary font-bold mr-2">{qIndex + 1}.</span>
              {q.text}
            </p>

            <div className="space-y-2">
              {q.options.map((option, oIndex) => {
                const isSelected = selected === oIndex
                return (
                  <button
                    key={oIndex}
                    type="button"
                    onClick={() => selectAnswer(q.id, oIndex)}
                    disabled={isSubmitting}
                    className={`w-full text-left flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border transition-all duration-150 text-sm ${
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border hover:border-primary/30 hover:bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {optionLetters[oIndex] ?? oIndex}
                    </span>
                    <span className={isSelected ? "font-medium" : ""}>{option}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground text-center sm:text-left">
          {answers.size} de {sorted.length} respondidas
        </p>
        <Button
          onClick={handleSubmit}
          disabled={!allAnswered || isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar respuestas"
          )}
        </Button>
      </div>
    </div>
  )
}
