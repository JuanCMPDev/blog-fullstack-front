import { customFetch } from "@/lib/customFetch"
import { buildApiUrl } from "@/lib/api"
import type {
  Project,
  ProjectCreatePayload,
  ProjectUpdatePayload,
  GitHubRepo,
} from "@/lib/types"

// ── Público ───────────────────────────────────────────────────────────

export async function fetchPublicProjects(): Promise<Project[]> {
  const response = await customFetch(buildApiUrl("projects"))

  if (!response.ok) {
    throw new Error(`Error al cargar proyectos: ${response.statusText}`)
  }

  return response.json()
}

// ── Admin CRUD ────────────────────────────────────────────────────────

export async function fetchAdminProjects(): Promise<Project[]> {
  const response = await customFetch(buildApiUrl("admin/projects"))

  if (!response.ok) {
    throw new Error(`Error al cargar proyectos (admin): ${response.statusText}`)
  }

  return response.json()
}

export async function createProject(payload: ProjectCreatePayload): Promise<Project> {
  const response = await customFetch(buildApiUrl("admin/projects"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => null)
    throw new Error(err?.message || "Error al crear el proyecto")
  }

  return response.json()
}

export async function updateProject(
  id: string,
  payload: ProjectUpdatePayload
): Promise<Project> {
  const response = await customFetch(buildApiUrl(`admin/projects/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => null)
    throw new Error(err?.message || "Error al actualizar el proyecto")
  }

  return response.json()
}

export async function deleteProject(id: string): Promise<void> {
  const response = await customFetch(buildApiUrl(`admin/projects/${id}`), {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Error al eliminar el proyecto")
  }
}

// ── Screenshot ────────────────────────────────────────────────────────

export async function uploadProjectScreenshot(
  id: string,
  file: File
): Promise<Project> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await customFetch(
    buildApiUrl(`admin/projects/${id}/screenshot`),
    {
      method: "POST",
      body: formData,
    }
  )

  if (!response.ok) {
    const err = await response.json().catch(() => null)
    throw new Error(err?.message || "Error al subir el screenshot")
  }

  return response.json()
}

// ── GitHub ─────────────────────────────────────────────────────────────

export async function fetchGitHubRepos(): Promise<GitHubRepo[]> {
  const response = await customFetch(
    buildApiUrl("admin/projects/github/repos")
  )

  if (!response.ok) {
    throw new Error("Error al obtener los repositorios de GitHub")
  }

  return response.json()
}

export async function importGitHubRepos(repos: GitHubRepo[]): Promise<Project[]> {
  const response = await customFetch(
    buildApiUrl("admin/projects/github/import"),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repos }),
    }
  )

  if (!response.ok) {
    const err = await response.json().catch(() => null)
    throw new Error(err?.message || "Error al importar repositorios")
  }

  return response.json()
}
