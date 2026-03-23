"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import {
  Edit,
  Trash2,
  MoreHorizontal,
  ExternalLink,
  Github,
  Eye,
  EyeOff,
  Star,
  StarOff,
  ImagePlus,
} from "lucide-react"
import {
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type {
  Project,
  ProjectUpdatePayload,
} from "@/lib/types"
import { ProjectStatus, ProjectGridSize } from "@/lib/types"

// ── Status helpers ────────────────────────────────────────────────────

const statusConfig: Record<
  ProjectStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  [ProjectStatus.IN_DEVELOPMENT]: { label: "En desarrollo", variant: "default" },
  [ProjectStatus.COMPLETED]: { label: "Completado", variant: "secondary" },
  [ProjectStatus.MAINTENANCE]: { label: "Mantenimiento", variant: "outline" },
}

// ── Props ──────────────────────────────────────────────────────────────

interface ProjectsTableProps {
  projects: Project[]
  isLoading: boolean
  onUpdate: (id: string, payload: ProjectUpdatePayload) => Promise<boolean>
  onDelete: (id: string) => Promise<boolean>
  onScreenshotUpload: (id: string, file: File) => Promise<boolean>
}

export function ProjectsTable({
  projects,
  isLoading,
  onUpdate,
  onDelete,
  onScreenshotUpload,
}: ProjectsTableProps) {
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [deleteProject, setDeleteProject] = useState<Project | null>(null)
  const [screenshotProject, setScreenshotProject] = useState<Project | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ── Edit form state ──
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    demoUrl: "",
    githubUrl: "",
    technologies: "",
    status: ProjectStatus.IN_DEVELOPMENT as ProjectStatus,
    gridSize: ProjectGridSize.NORMAL as ProjectGridSize,
    displayOrder: 0,
    isFeatured: false,
    isPublished: false,
  })

  const openEdit = useCallback((project: Project) => {
    setEditForm({
      name: project.name,
      description: project.description,
      demoUrl: project.demoUrl || "",
      githubUrl: project.githubUrl || "",
      technologies: project.technologies.join(", "),
      status: project.status,
      gridSize: project.gridSize,
      displayOrder: project.displayOrder,
      isFeatured: project.isFeatured,
      isPublished: project.isPublished,
    })
    setEditProject(project)
  }, [])

  const handleEditSubmit = useCallback(async () => {
    if (!editProject) return
    setIsSubmitting(true)
    const payload: ProjectUpdatePayload = {
      name: editForm.name,
      description: editForm.description,
      demoUrl: editForm.demoUrl || null,
      githubUrl: editForm.githubUrl || null,
      technologies: editForm.technologies
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      status: editForm.status,
      gridSize: editForm.gridSize,
      displayOrder: editForm.displayOrder,
      isFeatured: editForm.isFeatured,
      isPublished: editForm.isPublished,
    }
    const ok = await onUpdate(editProject.id, payload)
    setIsSubmitting(false)
    if (ok) setEditProject(null)
  }, [editProject, editForm, onUpdate])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteProject) return
    setIsSubmitting(true)
    const ok = await onDelete(deleteProject.id)
    setIsSubmitting(false)
    if (ok) setDeleteProject(null)
  }, [deleteProject, onDelete])

  const handleScreenshotSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!screenshotProject) return
      const form = e.currentTarget
      const fileInput = form.elements.namedItem("file") as HTMLInputElement
      const file = fileInput?.files?.[0]
      if (!file) return
      setIsSubmitting(true)
      const ok = await onScreenshotUpload(screenshotProject.id, file)
      setIsSubmitting(false)
      if (ok) setScreenshotProject(null)
    },
    [screenshotProject, onScreenshotUpload]
  )

  const togglePublish = useCallback(
    async (project: Project) => {
      await onUpdate(project.id, { isPublished: !project.isPublished })
    },
    [onUpdate]
  )

  const toggleFeatured = useCallback(
    async (project: Project) => {
      await onUpdate(project.id, { isFeatured: !project.isFeatured })
    },
    [onUpdate]
  )

  // ── Loading skeleton ──
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No hay proyectos aún. Importa desde GitHub o crea uno nuevo.
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Proyecto</TableHead>
              <TableHead className="hidden md:table-cell">Estado</TableHead>
              <TableHead className="hidden lg:table-cell">Tech</TableHead>
              <TableHead className="text-center w-20">Visible</TableHead>
              <TableHead className="text-center w-20">Dest.</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((project) => {
                const st = statusConfig[project.status]
                return (
                  <TableRow key={project.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {project.displayOrder}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {project.screenshotUrl ? (
                          <div className="relative h-10 w-16 rounded overflow-hidden bg-muted flex-shrink-0">
                            <Image
                              src={project.screenshotUrl}
                              alt={project.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-16 rounded bg-muted flex items-center justify-center flex-shrink-0">
                            <ImagePlus className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium truncate">{project.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {project.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={st.variant} className="text-xs">
                        {st.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {project.technologies.slice(0, 3).map((t) => (
                          <Badge
                            key={t}
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {t}
                          </Badge>
                        ))}
                        {project.technologies.length > 3 && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0"
                          >
                            +{project.technologies.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => togglePublish(project)}
                      >
                        {project.isPublished ? (
                          <Eye className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleFeatured(project)}
                      >
                        {project.isFeatured ? (
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        ) : (
                          <StarOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openEdit(project)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setScreenshotProject(project)}>
                            <ImagePlus className="h-4 w-4 mr-2" />
                            Screenshot
                          </DropdownMenuItem>
                          {project.githubUrl && (
                            <DropdownMenuItem asChild>
                              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                                <Github className="h-4 w-4 mr-2" />
                                Ver en GitHub
                              </a>
                            </DropdownMenuItem>
                          )}
                          {project.demoUrl && (
                            <DropdownMenuItem asChild>
                              <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Ver demo
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteProject(project)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </div>

      {/* ── Edit Dialog ── */}
      <Dialog open={!!editProject} onOpenChange={(open) => !open && setEditProject(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar proyecto</DialogTitle>
            <DialogDescription>
              Modifica los datos del proyecto &quot;{editProject?.name}&quot;
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nombre</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-desc">Descripción</Label>
              <Textarea
                id="edit-desc"
                rows={3}
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-github">GitHub URL</Label>
                <Input
                  id="edit-github"
                  value={editForm.githubUrl}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, githubUrl: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-demo">Demo URL</Label>
                <Input
                  id="edit-demo"
                  value={editForm.demoUrl}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, demoUrl: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-tech">Tecnologías (separadas por coma)</Label>
              <Input
                id="edit-tech"
                value={editForm.technologies}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, technologies: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Estado</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(v) =>
                    setEditForm((f) => ({ ...f, status: v as ProjectStatus }))
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ProjectStatus.IN_DEVELOPMENT}>En desarrollo</SelectItem>
                    <SelectItem value={ProjectStatus.COMPLETED}>Completado</SelectItem>
                    <SelectItem value={ProjectStatus.MAINTENANCE}>Mantenimiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Tamaño grid</Label>
                <Select
                  value={editForm.gridSize}
                  onValueChange={(v) =>
                    setEditForm((f) => ({ ...f, gridSize: v as ProjectGridSize }))
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ProjectGridSize.NORMAL}>Normal</SelectItem>
                    <SelectItem value={ProjectGridSize.FEATURED}>Destacado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-order">Orden</Label>
                <Input
                  id="edit-order"
                  type="number"
                  value={editForm.displayOrder}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      displayOrder: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={editForm.isPublished}
                  onCheckedChange={(v) => setEditForm((f) => ({ ...f, isPublished: v }))}
                />
                <Label>Publicado</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editForm.isFeatured}
                  onCheckedChange={(v) => setEditForm((f) => ({ ...f, isFeatured: v }))}
                />
                <Label>Destacado</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProject(null)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Dialog ── */}
      <Dialog open={!!deleteProject} onOpenChange={(open) => !open && setDeleteProject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar proyecto</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de eliminar &quot;{deleteProject?.name}&quot;? Esta acción no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteProject(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Screenshot Dialog ── */}
      <Dialog
        open={!!screenshotProject}
        onOpenChange={(open) => !open && setScreenshotProject(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subir screenshot</DialogTitle>
            <DialogDescription>
              Sube una imagen para &quot;{screenshotProject?.name}&quot;
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleScreenshotSubmit}>
            <div className="py-4">
              {screenshotProject?.screenshotUrl && (
                <div className="relative h-32 w-full rounded-lg overflow-hidden bg-muted mb-4">
                  <Image
                    src={screenshotProject.screenshotUrl}
                    alt="Screenshot actual"
                    fill
                    className="object-cover"
                    sizes="400px"
                  />
                </div>
              )}
              <Input
                name="file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                required
              />
              <p className="text-xs text-muted-foreground mt-2">
                JPG, PNG o WebP. Máximo 10MB.
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setScreenshotProject(null)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Subiendo..." : "Subir"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
