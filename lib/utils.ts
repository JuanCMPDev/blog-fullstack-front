import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Genera una URL completa para un avatar usando CloudFront
 * @param avatarPath Ruta relativa del avatar (ej: "avatars/123-456.webp")
 * @returns URL completa de CloudFront para el avatar
 */
export function getAvatarUrl(avatarPath?: string | null): string {
  if (!avatarPath) {
    return '/profile.jpg'
  }

  if (avatarPath.startsWith('http')) {
    return avatarPath
  }

  const normalizedPath = avatarPath.startsWith('/') ? avatarPath.substring(1) : avatarPath
  const mediaBaseUrl = (process.env.NEXT_PUBLIC_MEDIA_URL || '').replace(/\/+$/, '')

  if (!mediaBaseUrl) {
    return `/${normalizedPath}`
  }

  return `${mediaBaseUrl}/${normalizedPath}`
}
