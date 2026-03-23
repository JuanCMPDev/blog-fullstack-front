import type { MediaResource, NormalizedMediaAsset } from '@/lib/media-client'

interface BackendAssetEnvelope {
  asset?: {
    key?: string
    url?: string
    mimeType?: string
    type?: string
    size?: number
    width?: number
    height?: number
    durationSec?: number
  }
  imageUrl?: string
  url?: string
  key?: string
}

function inferMimeTypeFromUrl(url: string, fallback = 'application/octet-stream'): string {
  const normalizedUrl = url.toLowerCase()

  if (normalizedUrl.endsWith('.webp')) return 'image/webp'
  if (normalizedUrl.endsWith('.png')) return 'image/png'
  if (normalizedUrl.endsWith('.jpg') || normalizedUrl.endsWith('.jpeg')) return 'image/jpeg'
  if (normalizedUrl.endsWith('.gif')) return 'image/gif'
  if (normalizedUrl.endsWith('.mp4')) return 'video/mp4'
  if (normalizedUrl.endsWith('.webm')) return 'video/webm'

  return fallback
}

function toAssetKeyFromUrl(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.pathname.replace(/^\/+/, '') || `legacy-${Date.now()}`
  } catch {
    return `legacy-${Date.now()}`
  }
}

export function normalizeFallbackUploadResponse(
  payload: BackendAssetEnvelope,
  file: File,
  resource: MediaResource
): NormalizedMediaAsset {
  if (payload.asset?.url) {
    return {
      key: payload.asset.key || toAssetKeyFromUrl(payload.asset.url),
      url: payload.asset.url,
      type: payload.asset.type || payload.asset.mimeType || file.type || inferMimeTypeFromUrl(payload.asset.url),
      size: payload.asset.size ?? file.size,
      width: payload.asset.width,
      height: payload.asset.height,
      durationSec: payload.asset.durationSec,
    }
  }

  const legacyUrl = payload.imageUrl || payload.url

  if (!legacyUrl) {
    throw new Error(`Fallback de ${resource} sin URL retornada por backend`)
  }

  return {
    key: payload.key || toAssetKeyFromUrl(legacyUrl),
    url: legacyUrl,
    type: file.type || inferMimeTypeFromUrl(legacyUrl),
    size: file.size,
  }
}
