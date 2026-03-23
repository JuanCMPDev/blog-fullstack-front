"use client"

import { useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { useExamsForCourse } from "@/hooks/use-exams"
import { useAdminExam, createExam, updateExam, deleteExam } from "@/hooks/use-admin-exams"
import { ExamEditor } from "@/components/admin/ExamEditor"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function AdminExamsPage() {
  const params = useParams<{ courseId: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const { exams, isLoading } = useExamsForCourse(params.courseId)

  const [showEditor, setShowEditor] = useState(false)
  const [editingExamId, setEditingExamId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Fetch exam with correct answers for editing
  const { exam: editingExam } = useAdminExam(editingExamId)

  const handleCreate = useCallback(
    async (data: Parameters<typeof createExam>[0] extends infer T ? Omit<T, "courseId"> : never) => {
      setIsSaving(true)
      try {
        await createExam({ ...data, courseId: params.courseId })
        toast({ title: "Examen creado", description: "El examen ha sido creado correctamente." })
        setShowEditor(false)
        // Refresh: re-mount the list
        router.refresh()
      } catch (e) {
        toast({
          title: "Error",
          description: e instanceof Error ? e.message : "No se pudo crear el examen",
          variant: "destructive",
        })
      } finally {
        setIsSaving(false)
      }
    },
    [params.courseId, router, toast],
  )

  const handleUpdate = useCallback(
    async (data: Parameters<typeof createExam>[0] extends infer T ? Omit<T, "courseId"> : never) => {
      if (!editingExamId) return
      setIsSaving(true)
      try {
        await updateExam(editingExamId, data)
        toast({ title: "Examen actualizado", description: "Los cambios han sido guardados." })
        setEditingExamId(null)
        setShowEditor(false)
        router.refresh()
      } catch (e) {
        toast({
          title: "Error",
          description: e instanceof Error ? e.message : "No se pudo actualizar el examen",
          variant: "destructive",
        })
      } finally {
        setIsSaving(false)
      }
    },
    [editingExamId, router, toast],
  )

  const handleDelete = useCallback(
    async (examId: string) => {
      setIsDeleting(examId)
      try {
        await deleteExam(examId)
        toast({ title: "Examen eliminado" })
        router.refresh()
      } catch {
        toast({ title: "Error", description: "No se pudo eliminar el examen", variant: "destructive" })
      } finally {
        setIsDeleting(null)
      }
    },
    [router, toast],
  )

  const startEditing = (examId: string) => {
    setEditingExamId(examId)
    setShowEditor(true)
  }

  const startCreating = () => {
    setEditingExamId(null)
    setShowEditor(true)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container max-w-4xl px-4 py-8 mx-auto">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 gap-1 text-muted-foreground"
        onClick={() => router.push("/admin/courses")}
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a cursos
      </Button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestionar Exámenes</h1>
        {!showEditor && (
          <Button onClick={startCreating} className="gap-1">
            <Plus className="h-4 w-4" />
            Nuevo examen
          </Button>
        )}
      </div>

      {showEditor ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingExamId ? "Editar examen" : "Nuevo examen"}</CardTitle>
          </CardHeader>
          <CardContent>
            <ExamEditor
              initialData={
                editingExam && editingExamId
                  ? {
                      title: editingExam.title,
                      moduleOrder: editingExam.moduleOrder,
                      passingScore: editingExam.passingScore,
                      cooldownHours: editingExam.cooldownHours,
                      questions: editingExam.questions.map((q, i) => ({
                        text: q.text,
                        options: q.options,
                        correctIndex: q.correctIndex ?? 0,
                        order: q.order ?? i,
                      })),
                    }
                  : undefined
              }
              onSave={editingExamId ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowEditor(false)
                setEditingExamId(null)
              }}
              isSaving={isSaving}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {exams.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay exámenes creados para este curso.
            </p>
          ) : (
            exams.map((exam) => (
              <Card key={exam.id} className="border-border/30">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{exam.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Módulo {exam.moduleOrder} · {exam._count?.questions ?? 0} preguntas · Aprobación: {exam.passingScore}%
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => startEditing(exam.id)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          {isDeleting === exam.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar examen?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Se eliminarán todas las preguntas e intentos asociados. Esta acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(exam.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
