const DEFAULT_ERROR_MESSAGE = "Ha ocurrido un error"

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
}

function normalizePath(path: string): string {
  return path.replace(/^\/+/, "")
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "")
}

export function buildApiUrl(path: string): string {
  if (!path) return path
  if (isAbsoluteUrl(path)) return path

  const normalizedPath = normalizePath(path)
  const pathWithoutApiPrefix = normalizedPath.replace(/^api\/v1\//, "")

  // En el navegador, usar el proxy local de Next.js rewrites para evitar CORS
  if (typeof window !== "undefined") {
    return `/api/v1/${pathWithoutApiPrefix}`
  }

  // En el servidor (SSR), llamar directamente al backend
  const baseUrl = trimTrailingSlash(process.env.NEXT_PUBLIC_API_URL || "")
  if (!baseUrl) return path

  const baseHasApiPrefix = /\/api\/v1$/i.test(baseUrl)
  const finalPath = baseHasApiPrefix ? pathWithoutApiPrefix : normalizedPath
  return `${baseUrl}/${finalPath}`
}

export function extractApiErrorMessage(payload: unknown, fallback = DEFAULT_ERROR_MESSAGE): string {
  if (!payload || typeof payload !== "object") return fallback

  const candidate = payload as { message?: unknown; error?: unknown }

  if (typeof candidate.message === "string" && candidate.message.trim()) {
    return candidate.message
  }

  if (Array.isArray(candidate.message)) {
    const normalized = candidate.message
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .join(", ")

    if (normalized) {
      return normalized
    }
  }

  if (typeof candidate.error === "string" && candidate.error.trim()) {
    return candidate.error
  }

  return fallback
}

export async function extractApiErrorMessageFromResponse(
  response: Response,
  fallback = DEFAULT_ERROR_MESSAGE
): Promise<string> {
  try {
    const contentType = response.headers.get("content-type") || ""
    if (!contentType.includes("application/json")) {
      return fallback
    }

    const payload = await response.json()
    return extractApiErrorMessage(payload, fallback)
  } catch {
    return fallback
  }
}