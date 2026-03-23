import { describe, expect, it } from 'vitest'
import {
  createDefaultBlocks,
  extractYouTubeVideoId,
  isSafeYouTubeVideoId,
  parseContentV2,
  serializeContentV2,
  toLegacyMarkdown,
  type PostContentBlock,
} from './post-content-v2'

describe('post-content-v2 helpers', () => {
  it('extrae videoId desde URLs de YouTube soportadas', () => {
    expect(extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(extractYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(extractYouTubeVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('retorna null en URL no válida de YouTube', () => {
    expect(extractYouTubeVideoId('https://vimeo.com/123')).toBeNull()
    expect(extractYouTubeVideoId('')).toBeNull()
  })

  it('valida IDs seguros de YouTube para embeds', () => {
    expect(isSafeYouTubeVideoId('dQw4w9WgXcQ')).toBe(true)
    expect(isSafeYouTubeVideoId('abc_123-def')).toBe(true)
    expect(isSafeYouTubeVideoId('')).toBe(false)
    expect(isSafeYouTubeVideoId('id-invalido-con-demasiados-caracteres-123456789')).toBe(false)
    expect(isSafeYouTubeVideoId('bad<script>')).toBe(false)
  })

  it('serializa y parsea bloques de contentV2', () => {
    const blocks: PostContentBlock[] = [
      { id: 'b1', type: 'paragraph', text: 'Hola mundo' },
      {
        id: 'b2',
        type: 'image',
        asset: { key: 'posts/a.webp', url: 'https://cdn.example.com/posts/a.webp', mimeType: 'image/webp', size: 100 },
        alt: 'Portada',
      },
    ]

    const serialized = serializeContentV2(blocks)
    const parsed = parseContentV2(serialized)

    expect(parsed).toEqual(blocks)
  })

  it('convierte bloques a markdown legacy', () => {
    const blocks: PostContentBlock[] = [
      { id: 'p1', type: 'heading', level: 2, text: 'Título' },
      { id: 'p2', type: 'paragraph', text: 'Texto base' },
      {
        id: 'p3',
        type: 'videoEmbed',
        provider: 'youtube',
        videoId: 'dQw4w9WgXcQ',
      },
    ]

    const markdown = toLegacyMarkdown(blocks)
    expect(markdown).toContain('## Título')
    expect(markdown).toContain('Texto base')
    expect(markdown).toContain('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
  })

  it('crea bloques por defecto desde contenido existente', () => {
    const blocks = createDefaultBlocks('Contenido existente')
    expect(blocks).toHaveLength(1)
    expect(blocks[0]).toMatchObject({ type: 'paragraph', text: 'Contenido existente' })
  })
})
