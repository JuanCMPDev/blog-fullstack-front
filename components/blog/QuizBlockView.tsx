"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, RotateCcw, HelpCircle, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import type { QuizBlock } from "@/lib/post-content-v2"

interface QuizBlockViewProps {
  block: QuizBlock
}

const STORAGE_PREFIX = "quiz-answer-"

export function QuizBlockView({ block }: QuizBlockViewProps) {
  const [expanded, setExpanded] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)

  const storageKey = `${STORAGE_PREFIX}${block.id}`

  // Load saved answer from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved !== null) {
        const parsed = parseInt(saved, 10)
        if (!isNaN(parsed) && parsed >= 0 && parsed < block.options.length) {
          setSelectedIndex(parsed)
          setRevealed(true)
        }
      }
    } catch {
      // localStorage unavailable
    }
  }, [storageKey, block.options.length])

  const handleSelect = (index: number) => {
    if (revealed) return
    setSelectedIndex(index)
  }

  const handleSubmit = () => {
    if (selectedIndex === null || revealed) return
    setRevealed(true)
    try {
      localStorage.setItem(storageKey, String(selectedIndex))
    } catch {
      // localStorage unavailable
    }
  }

  const handleReset = () => {
    setSelectedIndex(null)
    setRevealed(false)
    try {
      localStorage.removeItem(storageKey)
    } catch {
      // localStorage unavailable
    }
  }

  const isCorrect = selectedIndex === block.correctIndex
  const hasAnswer = revealed

  return (
    <div className="not-prose my-6 rounded-xl border border-border/40 bg-card/50 overflow-hidden">
      {/* Collapsed header - always visible */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "w-full flex items-center gap-2 px-5 py-3 text-left transition-colors",
          expanded ? "bg-primary/5 border-b border-border/30" : "bg-primary/5 hover:bg-primary/10"
        )}
      >
        <HelpCircle className="h-4 w-4 text-primary flex-shrink-0" />
        <span className="text-sm font-semibold text-primary flex-1">Pregunta de repaso</span>
        {hasAnswer && (
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            isCorrect
              ? "bg-green-500/10 text-green-600 dark:text-green-400"
              : "bg-red-500/10 text-red-600 dark:text-red-400"
          )}>
            {isCorrect ? "Correcta" : "Incorrecta"}
          </span>
        )}
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground transition-transform duration-200",
          expanded && "rotate-180"
        )} />
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-5 space-y-4">
              {/* Question */}
              <p className="text-base font-medium leading-relaxed">{block.question}</p>

              {/* Options */}
              <div className="space-y-2">
                {block.options.map((option, index) => {
                  const isSelected = selectedIndex === index
                  const isCorrectOption = index === block.correctIndex

                  let optionStyle = "border-border/40 hover:border-primary/40 hover:bg-primary/5 cursor-pointer"

                  if (isSelected && !revealed) {
                    optionStyle = "border-primary bg-primary/10 ring-1 ring-primary/30"
                  }

                  if (revealed) {
                    if (isCorrectOption) {
                      optionStyle = "border-green-500/50 bg-green-500/10"
                    } else if (isSelected && !isCorrectOption) {
                      optionStyle = "border-red-500/50 bg-red-500/10"
                    } else {
                      optionStyle = "border-border/20 opacity-50 cursor-default"
                    }
                  }

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelect(index)}
                      disabled={revealed}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all duration-200",
                        optionStyle
                      )}
                    >
                      <span
                        className={cn(
                          "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border",
                          isSelected && !revealed && "bg-primary text-primary-foreground border-primary",
                          revealed && isCorrectOption && "bg-green-500 text-white border-green-500",
                          revealed && isSelected && !isCorrectOption && "bg-red-500 text-white border-red-500",
                          !isSelected && !revealed && "border-border/50 text-muted-foreground",
                          revealed && !isCorrectOption && !isSelected && "border-border/30 text-muted-foreground/50"
                        )}
                      >
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1 text-sm">{option}</span>
                      {revealed && isCorrectOption && (
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      )}
                      {revealed && isSelected && !isCorrectOption && (
                        <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Actions & Feedback */}
              {!revealed && (
                <Button
                  onClick={handleSubmit}
                  disabled={selectedIndex === null}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  Comprobar respuesta
                </Button>
              )}

              {revealed && (
                <div className="space-y-3">
                  <div
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg text-sm font-medium",
                      isCorrect
                        ? "bg-green-500/10 text-green-700 dark:text-green-400"
                        : "bg-red-500/10 text-red-700 dark:text-red-400"
                    )}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        ¡Correcto!
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" />
                        Incorrecto. La respuesta correcta es: {String.fromCharCode(65 + block.correctIndex)}
                      </>
                    )}
                  </div>

                  {block.explanation && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/20">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Explicación: </span>
                        {block.explanation}
                      </p>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="border-border/30"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                    Reiniciar
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
