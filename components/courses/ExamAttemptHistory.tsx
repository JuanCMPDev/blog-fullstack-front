"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useExamAttempts } from "@/hooks/use-exams"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface ExamAttemptHistoryProps {
  examId: string
}

export function ExamAttemptHistory({ examId }: ExamAttemptHistoryProps) {
  const { attempts, isLoading } = useExamAttempts(examId)
  const [expanded, setExpanded] = useState(false)

  if (isLoading || attempts.length === 0) return null

  return (
    <div className="mt-2">
      <Button
        variant="ghost"
        size="sm"
        className="text-xs text-muted-foreground gap-1 px-2"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {attempts.length} intento{attempts.length !== 1 ? "s" : ""} previo{attempts.length !== 1 ? "s" : ""}
      </Button>

      {expanded && (
        <div className="mt-2 space-y-2 pl-2 border-l-2 border-border/50">
          {attempts.map((attempt) => (
            <div
              key={attempt.id}
              className="flex items-center gap-2 sm:gap-3 text-xs p-2 rounded-lg bg-muted/30"
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  attempt.passed
                    ? "bg-green-500/10 text-green-500"
                    : "bg-red-500/10 text-red-500"
                }`}
              >
                {attempt.passed ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium">{attempt.score}%</span>
                <span className="text-muted-foreground ml-2">
                  {attempt.completedAt &&
                    formatDistanceToNow(new Date(attempt.completedAt), {
                      addSuffix: true,
                      locale: es,
                    })}
                </span>
              </div>
              {attempt.passed && (
                <span className="text-green-600 dark:text-green-400 font-medium">Aprobado</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
