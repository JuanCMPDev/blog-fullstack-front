import { describe, expect, it } from 'vitest'
import { validateMediaDescriptor } from './media-validation'

describe('validateMediaDescriptor', () => {
  it('acepta imagen válida', () => {
    const result = validateMediaDescriptor(
      { mimeType: 'image/webp', size: 2 * 1024 * 1024 },
      {
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxSizeBytes: 10 * 1024 * 1024,
      }
    )

    expect(result.ok).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('rechaza mime inválido', () => {
    const result = validateMediaDescriptor(
      { mimeType: 'application/pdf', size: 1024 },
      {
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxSizeBytes: 10 * 1024 * 1024,
      }
    )

    expect(result.ok).toBe(false)
    expect(result.errors[0]).toContain('MIME')
  })

  it('rechaza archivo mayor al límite', () => {
    const result = validateMediaDescriptor(
      { mimeType: 'video/mp4', size: 300 * 1024 * 1024, durationSec: 30 },
      {
        allowedMimeTypes: ['video/mp4', 'video/webm'],
        maxSizeBytes: 250 * 1024 * 1024,
      }
    )

    expect(result.ok).toBe(false)
    expect(result.errors[0]).toContain('tamaño')
  })

  it('rechaza duración mayor al límite', () => {
    const result = validateMediaDescriptor(
      { mimeType: 'video/mp4', size: 30 * 1024 * 1024, durationSec: 1000 },
      {
        allowedMimeTypes: ['video/mp4', 'video/webm'],
        maxSizeBytes: 250 * 1024 * 1024,
        maxDurationSec: 900,
      }
    )

    expect(result.ok).toBe(false)
    expect(result.errors[0]).toContain('duración')
  })
})
