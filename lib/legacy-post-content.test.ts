import { describe, expect, it } from 'vitest'
import { extractMarkdownFromHtml } from './legacy-post-content'

describe('legacy-post-content', () => {
  it('convierte html simple a markdown legible', () => {
    const html = '<h2>Titulo</h2><p>Hola <strong>mundo</strong></p><img src="https://cdn.example.com/a.webp" alt="A" />'
    const markdown = extractMarkdownFromHtml(html)

    expect(markdown).toContain('## Titulo')
    expect(markdown).toContain('Hola **mundo**')
    expect(markdown).toContain('![A](https://cdn.example.com/a.webp)')
  })
})
