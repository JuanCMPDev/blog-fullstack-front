"use client"

import { ProjectsTable } from "@/components/admin/ProjectsTable"
import { GitHubImportDialog } from "@/components/admin/GitHubImportDialog"
import { useAdminProjects } from "@/hooks/use-projects"
import { Badge } from "@/components/ui/badge"
import { FolderKanban } from "lucide-react"

export default function AdminProjectsPage() {
  const {
    projects,
    isLoading,
    refetch,
    handleUpdate,
    handleDelete,
    handleScreenshotUpload,
  } = useAdminProjects()

  const publishedCount = projects.filter((p) => p.isPublished).length
  const draftCount = projects.filter((p) => !p.isPublished).length

  return (
    <main className="space-y-6 p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FolderKanban className="h-7 w-7" />
            Proyectos
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {publishedCount} publicado{publishedCount !== 1 ? "s" : ""}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {draftCount} borrador{draftCount !== 1 ? "es" : ""}
            </Badge>
          </div>
        </div>
        <GitHubImportDialog onImportComplete={refetch} />
      </div>

      <ProjectsTable
        projects={projects}
        isLoading={isLoading}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onScreenshotUpload={handleScreenshotUpload}
      />
    </main>
  )
}
