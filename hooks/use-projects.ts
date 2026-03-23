import { useState, useEffect, useCallback } from "react"
import { toast } from "@/hooks/use-toast"
import type {
  Project,
  ProjectCreatePayload,
  ProjectUpdatePayload,
  GitHubRepo,
} from "@/lib/types"
import {
  fetchPublicProjects,
  fetchAdminProjects,
  createProject,
  updateProject,
  deleteProject,
  uploadProjectScreenshot,
  fetchGitHubRepos,
  importGitHubRepos,
} from "@/lib/services/projectService"

// ── Hook público (para /projects) ─────────────────────────────────────

export function usePublicProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchPublicProjects()
      setProjects(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar proyectos"
      setError(msg)
      console.error("usePublicProjects:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { projects, isLoading, error, refetch: fetch }
}

// ── Hook admin (para /admin/projects) ─────────────────────────────────

export function useAdminProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchAdminProjects()
      setProjects(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar proyectos"
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  const handleCreate = useCallback(
    async (payload: ProjectCreatePayload): Promise<Project | null> => {
      try {
        const created = await createProject(payload)
        toast({ title: "Proyecto creado", description: created.name })
        await fetch()
        return created
      } catch (err) {
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Error al crear",
          variant: "destructive",
        })
        return null
      }
    },
    [fetch]
  )

  const handleUpdate = useCallback(
    async (id: string, payload: ProjectUpdatePayload): Promise<boolean> => {
      try {
        await updateProject(id, payload)
        toast({ title: "Proyecto actualizado" })
        await fetch()
        return true
      } catch (err) {
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Error al actualizar",
          variant: "destructive",
        })
        return false
      }
    },
    [fetch]
  )

  const handleDelete = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await deleteProject(id)
        toast({ title: "Proyecto eliminado" })
        await fetch()
        return true
      } catch (err) {
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Error al eliminar",
          variant: "destructive",
        })
        return false
      }
    },
    [fetch]
  )

  const handleScreenshotUpload = useCallback(
    async (id: string, file: File): Promise<boolean> => {
      try {
        await uploadProjectScreenshot(id, file)
        toast({ title: "Screenshot actualizado" })
        await fetch()
        return true
      } catch (err) {
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Error al subir screenshot",
          variant: "destructive",
        })
        return false
      }
    },
    [fetch]
  )

  return {
    projects,
    isLoading,
    error,
    refetch: fetch,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleScreenshotUpload,
  }
}

// ── Hook GitHub import ────────────────────────────────────────────────

export function useGitHubImport() {
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRepos = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchGitHubRepos()
      setRepos(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar repos"
      setError(msg)
      toast({ title: "Error", description: msg, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleImport = useCallback(
    async (selected: GitHubRepo[]): Promise<Project[] | null> => {
      setIsImporting(true)
      try {
        const imported = await importGitHubRepos(selected)
        toast({
          title: "Importación completada",
          description: `${imported.length} proyecto(s) importado(s)`,
        })
        return imported
      } catch (err) {
        toast({
          title: "Error al importar",
          description: err instanceof Error ? err.message : "Error desconocido",
          variant: "destructive",
        })
        return null
      } finally {
        setIsImporting(false)
      }
    },
    []
  )

  return { repos, isLoading, isImporting, error, fetchRepos, handleImport }
}
