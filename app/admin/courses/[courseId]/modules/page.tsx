"use client"

import { useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  FileText,
  ClipboardCheck,
  Layers,
} from "lucide-react"
import { useModulesForCourse, createModule, updateModule, deleteModule } from "@/hooks/use-modules"
import { useToast } from "@/hooks/use-toast"

export default function AdminModulesPage() {
  const params = useParams<{ courseId: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const { modules, isLoading, refresh } = useModulesForCourse(params.courseId)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [order, setOrder] = useState(1)
  const [saving, setSaving] = useState(false)

  const resetForm = () => {
    setTitle("")
    setOrder(modules.length > 0 ? Math.max(...modules.map((m) => m.order)) + 1 : 1)
    setEditingId(null)
  }

  const openCreate = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEdit = (mod: { id: string; title: string; order: number }) => {
    setEditingId(mod.id)
    setTitle(mod.title)
    setOrder(mod.order)
    setDialogOpen(true)
  }

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      toast({ title: "El título es requerido", variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        await updateModule(editingId, { title: title.trim(), order })
        toast({ title: "Módulo actualizado" })
      } else {
        await createModule(params.courseId, { title: title.trim(), order })
        toast({ title: "Módulo creado" })
      }
      setDialogOpen(false)
      resetForm()
      refresh()
    } catch (e) {
      toast({
        title: e instanceof Error ? e.message : "Error al guardar",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }, [editingId, title, order, params.courseId, toast, refresh])

  const handleDelete = useCallback(
    async (moduleId: string) => {
      try {
        await deleteModule(moduleId)
        toast({ title: "Módulo eliminado" })
        refresh()
      } catch {
        toast({ title: "Error al eliminar el módulo", variant: "destructive" })
      }
    },
    [toast, refresh],
  )

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <main className="space-y-6 p-4 sm:p-6 md:p-8">
      <Button
        variant="ghost"
        size="sm"
        className="gap-1 text-muted-foreground"
        onClick={() => router.push("/admin/courses")}
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a cursos
      </Button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Layers className="h-7 w-7" />
            Módulos del Curso
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {modules.length} módulo{modules.length !== 1 ? "s" : ""}
          </p>
        </div>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Módulo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Módulo" : "Nuevo Módulo"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>Título</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Introducción a React"
                />
              </div>
              <div>
                <Label>Orden</Label>
                <Input
                  type="number"
                  min={1}
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                />
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingId ? "Guardar Cambios" : "Crear Módulo"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {modules.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No hay módulos todavía. Crea el primero.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {modules.map((mod) => (
            <Card key={mod.id} className="border-border/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {mod.order}
                    </div>
                    <div>
                      <CardTitle className="text-base">{mod.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-[10px]">
                          <FileText className="h-3 w-3 mr-1" />
                          {mod.posts.length} post{mod.posts.length !== 1 ? "s" : ""}
                        </Badge>
                        {mod.exam && (
                          <Badge variant="outline" className="text-[10px]">
                            <ClipboardCheck className="h-3 w-3 mr-1" />
                            Examen: {mod.exam.title}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Gestionar exámenes"
                      asChild
                    >
                      <Link href={`/admin/courses/${params.courseId}/exams`}>
                        <ClipboardCheck className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Editar módulo"
                      onClick={() => openEdit(mod)}
                    >
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
                          <AlertDialogTitle>Eliminar módulo</AlertDialogTitle>
                          <AlertDialogDescription>
                            Se desvincularán los posts y se eliminará el examen asociado. Esta acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(mod.id)}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              {mod.posts.length > 0 && (
                <CardContent className="pt-0">
                  <div className="space-y-1 pl-12">
                    {mod.posts.map((post) => (
                      <div
                        key={post.id}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{post.title}</span>
                        {post.status === "DRAFT" && (
                          <Badge variant="outline" className="text-[10px]">
                            Borrador
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
