export interface PostMediaAsset {
  key: string
  url: string
  mimeType: string
  size: number
  width?: number
  height?: number
  durationSec?: number
}

interface PostContentBlockBase {
  id: string
}

export interface ParagraphBlock extends PostContentBlockBase {
  type: 'paragraph'
  text: string
}

export interface HeadingBlock extends PostContentBlockBase {
  type: 'heading'
  level: 1 | 2 | 3
  text: string
}

export interface ImageBlock extends PostContentBlockBase {
  type: 'image'
  asset: PostMediaAsset
  alt?: string
  caption?: string
}

export interface GalleryBlock extends PostContentBlockBase {
  type: 'gallery'
  items: PostMediaAsset[]
  caption?: string
}

export interface VideoEmbedBlock extends PostContentBlockBase {
  type: 'videoEmbed'
  provider: 'youtube'
  videoId: string
  title?: string
}

export interface VideoFileBlock extends PostContentBlockBase {
  type: 'videoFile'
  asset: PostMediaAsset
  poster?: PostMediaAsset
  caption?: string
}

export interface QuizBlock extends PostContentBlockBase {
  type: 'quiz'
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
}

export type PostContentBlock =
  | ParagraphBlock
  | HeadingBlock
  | ImageBlock
  | GalleryBlock
  | VideoEmbedBlock
  | VideoFileBlock
  | QuizBlock

function buildBlockId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createParagraphBlock(text = ''): ParagraphBlock {
  return {
    id: buildBlockId('p'),
    type: 'paragraph',
    text,
  }
}

export function createDefaultBlocks(existingContent?: string): PostContentBlock[] {
  const trimmed = (existingContent || '').trim()
  return [createParagraphBlock(trimmed)]
}

export function serializeContentV2(blocks: PostContentBlock[]): string {
  return JSON.stringify(blocks)
}

export function parseContentV2(payload?: string | null): PostContentBlock[] | null {
  if (!payload) return null

  try {
    const parsed = JSON.parse(payload)
    if (!Array.isArray(parsed)) return null
    return parsed as PostContentBlock[]
  } catch {
    return null
  }
}

export function extractYouTubeVideoId(input: string): string | null {
  if (!input?.trim()) return null

  try {
    const url = new URL(input)
    const host = url.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0]
      return id || null
    }

    if (host === 'youtube.com') {
      if (url.pathname === '/watch') {
        return url.searchParams.get('v')
      }

      if (url.pathname.startsWith('/embed/')) {
        const segments = url.pathname.split('/').filter(Boolean)
        return segments[1] || null
      }

      if (url.pathname.startsWith('/shorts/')) {
        const segments = url.pathname.split('/').filter(Boolean)
        return segments[1] || null
      }
    }

    return null
  } catch {
    return null
  }
}

export function isSafeYouTubeVideoId(value: string): boolean {
  return /^[a-zA-Z0-9_-]{6,20}$/.test(value)
}

function escapeMarkdownText(text: string): string {
  return text.replace(/\n{3,}/g, '\n\n').trim()
}

export function toLegacyMarkdown(blocks: PostContentBlock[]): string {
  const chunks: string[] = []

  blocks.forEach((block) => {
    if (block.type === 'paragraph') {
      if (block.text.trim()) {
        chunks.push(escapeMarkdownText(block.text))
      }
      return
    }

    if (block.type === 'heading') {
      const prefix = '#'.repeat(block.level)
      chunks.push(`${prefix} ${escapeMarkdownText(block.text)}`)
      return
    }

    if (block.type === 'image') {
      const alt = block.alt?.trim() || 'Imagen'
      chunks.push(`![${alt}](${block.asset.url})`)
      if (block.caption?.trim()) {
        chunks.push(`_${escapeMarkdownText(block.caption)}_`)
      }
      return
    }

    if (block.type === 'gallery') {
      block.items.forEach((item, index) => {
        chunks.push(`![Imagen ${index + 1}](${item.url})`)
      })
      if (block.caption?.trim()) {
        chunks.push(`_${escapeMarkdownText(block.caption)}_`)
      }
      return
    }

    if (block.type === 'videoEmbed') {
      chunks.push(`[Video de YouTube](https://www.youtube.com/watch?v=${block.videoId})`)
      return
    }

    if (block.type === 'videoFile') {
      chunks.push(`[Video subido](${block.asset.url})`)
      if (block.caption?.trim()) {
        chunks.push(`_${escapeMarkdownText(block.caption)}_`)
      }
      return
    }

    if (block.type === 'quiz') {
      chunks.push(`**Pregunta:** ${escapeMarkdownText(block.question)}`)
      block.options.forEach((opt, i) => {
        const marker = i === block.correctIndex ? '✅' : '⬚'
        chunks.push(`${marker} ${escapeMarkdownText(opt)}`)
      })
      if (block.explanation?.trim()) {
        chunks.push(`_${escapeMarkdownText(block.explanation)}_`)
      }
    }
  })

  return chunks.join('\n\n').trim()
}
