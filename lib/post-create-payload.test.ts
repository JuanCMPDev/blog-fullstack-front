import { describe, expect, it } from 'vitest'
import { buildCreatePostFormData } from './post-create-payload'

describe('buildCreatePostFormData', () => {
  it('no incluye authorId y preserva campos esperados', () => {
    const formData = buildCreatePostFormData({
      title: 'Mi post',
      slug: 'mi-post',
      excerpt: 'Resumen',
      content: 'Contenido',
      tags: ['react', 'next'],
      status: 'PUBLISHED',
      publishDate: '2026-02-16T00:00:00.000Z',
    })

    expect(formData.get('authorId')).toBeNull()
    expect(formData.get('title')).toBe('Mi post')
    expect(formData.get('status')).toBe('PUBLISHED')
    expect(formData.get('publishDate')).toBe('2026-02-16T00:00:00.000Z')
    expect(formData.getAll('tags')).toEqual(['react', 'next'])
  })

  it('no incluye publishDate cuando status es DRAFT', () => {
    const formData = buildCreatePostFormData({
      title: 'Borrador',
      slug: 'borrador',
      excerpt: 'Resumen',
      content: 'Contenido',
      status: 'DRAFT',
      publishDate: '2026-02-16T00:00:00.000Z',
    })

    expect(formData.get('status')).toBe('DRAFT')
    expect(formData.get('publishDate')).toBeNull()
  })

  it('acepta status SCHEDULED', () => {
    const formData = buildCreatePostFormData({
      title: 'Programado',
      slug: 'programado',
      excerpt: 'Resumen',
      content: 'Contenido',
      status: 'SCHEDULED',
      publishDate: '2026-02-20T00:00:00.000Z',
    })

    expect(formData.get('status')).toBe('SCHEDULED')
    expect(formData.get('publishDate')).toBe('2026-02-20T00:00:00.000Z')
  })

  it('incluye contentV2 cuando se envía', () => {
    const contentV2 = JSON.stringify([{ id: 'p-1', type: 'paragraph', text: 'Hola' }])

    const formData = buildCreatePostFormData({
      title: 'Post V2',
      slug: 'post-v2',
      excerpt: 'Resumen',
      content: 'Hola',
      contentV2,
      status: 'PUBLISHED',
    })

    expect(formData.get('contentV2')).toBe(contentV2)
  })
})
