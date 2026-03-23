"use client"

import { useState } from "react"
import { useCourses, type CreateCourseInput } from "@/hooks/use-courses"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { BookOpen, Plus, Pencil, Trash2, Loader2, ClipboardCheck, Layers } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 100)
}

export default function AdminCoursesPage() {
  const { courses, isLoading, createCourse, updateCourse, deleteCourse } = useCourses()
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CreateCourseInput>({
    title: "",
    slug: "",
    description: "",
    difficulty: "EASY",
  })
  const [saving, setSaving] = useState(false)

  const resetForm = () => {
    setForm({ title: "", slug: "", description: "", difficulty: "EASY" })
    setEditingId(null)
  }

  const openCreate = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEdit = (course: { id: string; title: string; slug: string; description: string; difficulty: string }) => {
    setEditingId(course.id)
    setForm({
      title: course.title,
      slug: course.slug,
      description: course.description,
      difficulty: course.difficulty as CreateCourseInput["difficulty"],
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.slug || !form.description) {
      toast({ title: "Completa todos los campos requeridos", variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        await updateCourse(editingId, form)
        toast({ title: "Curso actualizado" })
      } else {
        await createCourse(form)
        toast({ title: "Curso creado" })
      }
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "Error al guardar",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCourse(id)
      toast({ title: "Curso eliminado" })
    } catch {
      toast({ title: "Error al eliminar el curso", variant: "destructive" })
    }
  }

  return (
    <main className="space-y-6 p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-7 w-7" />
            Cursos
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {courses.length} curso{courses.length !== 1 ? "s" : ""} creado{courses.length !== 1 ? "s" : ""}
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Curso
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Curso" : "Nuevo Curso"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-sm font-medium">Titulo</label>
                <Input
                  value={form.title}
                  onChange={(e) => {
                    const title = e.target.value
                    setForm((f) => ({
                      ...f,
                      title,
                      ...(!editingId ? { slug: slugify(title) } : {}),
                    }))
                  }}
                  placeholder="Ej: Algoritmos de Ordenamiento"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Slug</label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="algoritmos-de-ordenamiento"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descripcion</label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Descripcion del curso..."
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Dificultad</label>
                <Select
                  value={form.difficulty}
                  onValueChange={(v) => setForm((f) => ({ ...f, difficulty: v as CreateCourseInput["difficulty"] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Principiante</SelectItem>
                    <SelectItem value="MEDIUM">Intermedio</SelectItem>
                    <SelectItem value="HARD">Avanzado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingId ? "Guardar Cambios" : "Crear Curso"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No hay cursos todavia. Crea el primero.</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titulo</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Dificultad</TableHead>
                <TableHead className="text-center">Posts</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{course.slug}</TableCell>
                  <TableCell>
                    <Badge className={DIFFICULTY_COLORS[course.difficulty] || ""} variant="secondary">
                      {DIFFICULTY_LABELS[course.difficulty] || course.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{course._count?.posts ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild title="Módulos">
                        <Link href={`/admin/courses/${course.id}/modules`}>
                          <Layers className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild title="Exámenes">
                        <Link href={`/admin/courses/${course.id}/exams`}>
                          <ClipboardCheck className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(course)} title="Editar curso">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Eliminar curso</AlertDialogTitle>
                            <AlertDialogDescription>
                              Se desvincularan los posts asociados. Esta accion no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(course.id)}>
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </main>
  )
}
