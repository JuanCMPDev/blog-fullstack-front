export interface MediaDescriptor {
  mimeType: string
  size: number
  durationSec?: number
}

export interface MediaValidationRules {
  allowedMimeTypes: string[]
  maxSizeBytes: number
  maxDurationSec?: number
}

export interface MediaValidationResult {
  ok: boolean
  errors: string[]
}

export const IMAGE_VALIDATION_RULES: MediaValidationRules = {
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  maxSizeBytes: 10 * 1024 * 1024,
}

export const VIDEO_VALIDATION_RULES: MediaValidationRules = {
  allowedMimeTypes: ['video/mp4', 'video/webm'],
  maxSizeBytes: 250 * 1024 * 1024,
  maxDurationSec: 15 * 60,
}

export function validateMediaDescriptor(
  descriptor: MediaDescriptor,
  rules: MediaValidationRules
): MediaValidationResult {
  const errors: string[] = []

  if (!rules.allowedMimeTypes.includes(descriptor.mimeType)) {
    errors.push(`MIME no permitido: ${descriptor.mimeType}`)
  }

  if (descriptor.size > rules.maxSizeBytes) {
    errors.push(`El tamaño excede el máximo permitido (${rules.maxSizeBytes} bytes)`)
  }

  if (
    typeof rules.maxDurationSec === 'number' &&
    typeof descriptor.durationSec === 'number' &&
    descriptor.durationSec > rules.maxDurationSec
  ) {
    errors.push(`La duración excede el máximo permitido (${rules.maxDurationSec} segundos)`)
  }

  return {
    ok: errors.length === 0,
    errors,
  }
}

export function validateMediaFile(file: File, rules: MediaValidationRules): MediaValidationResult {
  return validateMediaDescriptor(
    {
      mimeType: file.type,
      size: file.size,
    },
    rules
  )
}
