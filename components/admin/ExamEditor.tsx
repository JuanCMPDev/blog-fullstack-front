"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react"

interface QuestionDraft {
  text: string
  options: string[]
  correctIndex: number
  order: number
}

interface ExamEditorProps {
  initialData?: {
    title: string
    moduleOrder: number
    passingScore: number
    cooldownHours: number
    questions: QuestionDraft[]
  }
  onSave: (data: {
    title: string
    moduleOrder: number
    passingScore: number
    cooldownHours: number
    questions: QuestionDraft[]
  }) => Promise<void>
  onCancel: () => void
  isSaving: boolean
}

export function ExamEditor({ initialData, onSave, onCancel, isSaving }: ExamEditorProps) {
  const [title, setTitle] = useState(initialData?.title ?? "")
  const [moduleOrder, setModuleOrder] = useState(initialData?.moduleOrder ?? 1)
  const [passingScore, setPassingScore] = useState(initialData?.passingScore ?? 70)
  const [cooldownHours, setCooldownHours] = useState(initialData?.cooldownHours ?? 24)
  const [questions, setQuestions] = useState<QuestionDraft[]>(
    initialData?.questions ?? [
      { text: "", options: ["", ""], correctIndex: 0, order: 0 },
    ],
  )

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { text: "", options: ["", ""], correctIndex: 0, order: questions.length },
    ])
  }

  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx).map((q, i) => ({ ...q, order: i })))
  }

  const updateQuestion = (idx: number, field: keyof QuestionDraft, value: unknown) => {
    setQuestions(
      questions.map((q, i) => (i === idx ? { ...q, [field]: value } : q)),
    )
  }

  const addOption = (qIdx: number) => {
    const q = questions[qIdx]
    updateQuestion(qIdx, "options", [...q.options, ""])
  }

  const removeOption = (qIdx: number, oIdx: number) => {
    const q = questions[qIdx]
    if (q.options.length <= 2) return
    const newOptions = q.options.filter((_, i) => i !== oIdx)
    const newCorrect = q.correctIndex >= oIdx && q.correctIndex > 0 ? q.correctIndex - 1 : q.correctIndex
    setQuestions(
      questions.map((q2, i) =>
        i === qIdx ? { ...q2, options: newOptions, correctIndex: Math.min(newCorrect, newOptions.length - 1) } : q2,
      ),
    )
  }

  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    const q = questions[qIdx]
    const newOptions = q.options.map((o, i) => (i === oIdx ? value : o))
    updateQuestion(qIdx, "options", newOptions)
  }

  const handleSubmit = () => {
    onSave({ title, moduleOrder, passingScore, cooldownHours, questions })
  }

  const isValid =
    title.trim() &&
    moduleOrder > 0 &&
    questions.length > 0 &&
    questions.every(
      (q) =>
        q.text.trim() &&
        q.options.length >= 2 &&
        q.options.every((o) => o.trim()) &&
        q.correctIndex < q.options.length,
    )

  const optionLetters = ["A", "B", "C", "D", "E", "F", "G", "H"]

  return (
    <div className="space-y-6">
      {/* Config */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label>Título del examen</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Evaluación Módulo 1" />
        </div>
        <div>
          <Label>Módulo (courseOrder)</Label>
          <Input type="number" min={1} value={moduleOrder} onChange={(e) => setModuleOrder(Number(e.target.value))} />
        </div>
        <div>
          <Label>Porcentaje para aprobar</Label>
          <Input type="number" min={1} max={100} value={passingScore} onChange={(e) => setPassingScore(Number(e.target.value))} />
        </div>
        <div>
          <Label>Cooldown (horas)</Label>
          <Input type="number" min={0} value={cooldownHours} onChange={(e) => setCooldownHours(Number(e.target.value))} />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Preguntas ({questions.length})</h3>
          <Button variant="outline" size="sm" onClick={addQuestion} className="gap-1">
            <Plus className="h-4 w-4" />
            Agregar pregunta
          </Button>
        </div>

        {questions.map((q, qIdx) => (
          <div key={qIdx} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-start gap-2">
              <GripVertical className="h-5 w-5 text-muted-foreground mt-2 flex-shrink-0" />
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Pregunta {qIdx + 1}</Label>
                <Textarea
                  value={q.text}
                  onChange={(e) => updateQuestion(qIdx, "text", e.target.value)}
                  placeholder="Escribe la pregunta..."
                  className="min-h-[60px] resize-none"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeQuestion(qIdx)}
                disabled={questions.length <= 1}
                className="text-destructive hover:text-destructive/90 px-2 mt-5"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="ml-7 space-y-2">
              {q.options.map((opt, oIdx) => (
                <div key={oIdx} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQuestion(qIdx, "correctIndex", oIdx)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                      q.correctIndex === oIdx
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground hover:bg-primary/10"
                    }`}
                    title={q.correctIndex === oIdx ? "Respuesta correcta" : "Marcar como correcta"}
                  >
                    {optionLetters[oIdx]}
                  </button>
                  <Input
                    value={opt}
                    onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                    placeholder={`Opción ${optionLetters[oIdx]}`}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(qIdx, oIdx)}
                    disabled={q.options.length <= 2}
                    className="px-2 text-muted-foreground"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addOption(qIdx)}
                className="text-xs text-muted-foreground gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Agregar opción
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={!isValid || isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            "Guardar examen"
          )}
        </Button>
      </div>
    </div>
  )
}
