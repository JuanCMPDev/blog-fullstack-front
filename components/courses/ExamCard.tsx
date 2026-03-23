"use client"

import { Lock, Trophy, Clock, AlertCircle, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import type { ExamStatus } from "@/lib/types"

interface ExamCardExam {
  id: string
  title: string
  passingScore: number
  questions?: { id: string }[]
  _count?: { questions?: number; attempts?: number }
}

interface ExamCardProps {
  exam: ExamCardExam
  status: ExamStatus | undefined
  onStart: () => void
}

function CooldownTimer({ endsAt }: { endsAt: string }) {
  const [remaining, setRemaining] = useState("")

  useEffect(() => {
    const update = () => {
      const diff = new Date(endsAt).getTime() - Date.now()
      if (diff <= 0) {
        setRemaining("Disponible")
        return
      }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setRemaining(`${h}h ${m}m ${s}s`)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [endsAt])

  return <span>{remaining}</span>
}

export function ExamCard({ exam, status, onStart }: ExamCardProps) {
  const isLocked = !status?.unlocked
  const isPassed = status?.passed ?? false
  const questionCount = exam._count?.questions ?? exam.questions?.length ?? 0

  return (
    <div
      className={`relative rounded-xl border p-4 sm:p-5 transition-all duration-200 ${
        isPassed
          ? "border-green-500/30 bg-green-500/5"
          : isLocked
          ? "border-border/50 bg-muted/30 opacity-75"
          : "border-primary/30 bg-primary/5 hover:border-primary/50"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div
            className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${
              isPassed
                ? "bg-green-500/10 text-green-500"
                : isLocked
                ? "bg-muted text-muted-foreground"
                : "bg-primary/10 text-primary"
            }`}
          >
            {isPassed ? (
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : isLocked ? (
              <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-sm sm:text-base truncate">
              {exam.title}
            </h4>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] sm:text-xs text-muted-foreground mt-0.5">
              <span>{questionCount} preguntas</span>
              <span className="hidden sm:inline">·</span>
              <span>Aprobación: {exam.passingScore}%</span>
              {status && status.attemptCount > 0 && (
                <>
                  <span className="hidden sm:inline">·</span>
                  <span>{status.attemptCount} intento{status.attemptCount !== 1 ? "s" : ""}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 pl-10 sm:pl-0">
          {isPassed && status?.bestScore != null && (
            <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
              {status.bestScore}%
            </span>
          )}

          {isLocked && status?.reason === "cooldown" && status.cooldownEndsAt && (
            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <Clock className="h-3.5 w-3.5" />
              <CooldownTimer endsAt={status.cooldownEndsAt} />
            </div>
          )}

          {isLocked && status?.reason === "posts_incomplete" && (
            <span className="text-xs text-muted-foreground">Completa las lecciones</span>
          )}

          {isLocked && status?.reason === "previous_exam_not_passed" && (
            <span className="text-xs text-muted-foreground">Aprueba el examen anterior</span>
          )}

          {!isLocked && !isPassed && (
            <Button size="sm" onClick={onStart} className="gap-1 w-full sm:w-auto">
              Iniciar
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}

          {isPassed && (
            <Button size="sm" variant="outline" onClick={onStart} className="gap-1 w-full sm:w-auto">
              Repetir
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
