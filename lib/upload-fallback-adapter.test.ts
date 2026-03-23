import { describe, expect, it } from 'vitest'
import { normalizeFallbackUploadResponse } from './upload-fallback-adapter'

function createFile(name: string, type: string, size = 1024): File {
  const file = new File(['x'.repeat(size)], name, { type })
  return file
}

describe('upload fallback contract', () => {
  it('normaliza payload nuevo con envelope asset', () => {
    const file = createFile('video.mp4', 'video/mp4', 2048)

    const result = normalizeFallbackUploadResponse(
      {
        asset: {
          key: 'post-video/abc.mp4',
          url: 'https://cdn.example.com/post-video/abc.mp4',
          mimeType: 'video/mp4',
          size: 9999,
          durationSec: 42,
        },
      },
      file,
      'post-video'
    )

    expect(result.key).toBe('post-video/abc.mp4')
    expect(result.url).toBe('https://cdn.example.com/post-video/abc.mp4')
    expect(result.type).toBe('video/mp4')
    expect(result.size).toBe(9999)
    expect(result.durationSec).toBe(42)
  })

  it('normaliza payload legacy con imageUrl/key', () => {
    const file = createFile('image.png', 'image/png', 1500)

    const result = normalizeFallbackUploadResponse(
      {
        imageUrl: 'https://cdn.example.com/post-image/legacy.png',
        key: 'post-image/legacy.png',
      },
      file,
      'post-image'
    )

    expect(result.key).toBe('post-image/legacy.png')
    expect(result.url).toBe('https://cdn.example.com/post-image/legacy.png')
    expect(result.type).toBe('image/png')
    expect(result.size).toBe(1500)
  })

  it('lanza error cuando backend no retorna url utilizable', () => {
    const file = createFile('poster.webp', 'image/webp')

    expect(() => normalizeFallbackUploadResponse({}, file, 'post-video-poster')).toThrow(
      'Fallback de post-video-poster sin URL retornada por backend'
    )
  })
})
