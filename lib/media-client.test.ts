import { beforeEach, describe, expect, it, vi } from 'vitest'
import { customFetch } from './customFetch'
import {
  initMediaUpload,
  completeMediaUpload,
  deleteMediaAsset,
  getMediaAssetMetadata,
} from './media-client'

vi.mock('./customFetch', () => ({
  customFetch: vi.fn(),
}))

describe('media-client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('inicia upload con payload esperado', async () => {
    vi.mocked(customFetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          uploadId: 'up_1',
          method: 'PUT',
          uploadUrl: 'https://upload.example.com/up_1',
          headers: { 'content-type': 'image/webp' },
          key: 'posts/asset.webp',
          expiresInSec: 900,
        }),
        { status: 201, headers: { 'content-type': 'application/json' } }
      )
    )

    const result = await initMediaUpload({
      fileName: 'asset.webp',
      mimeType: 'image/webp',
      size: 1024,
      resource: 'post-image',
    })

    expect(customFetch).toHaveBeenCalledWith(
      'media/uploads/init',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    )
    expect(result.uploadId).toBe('up_1')
    expect(result.key).toBe('posts/asset.webp')
  })

  it('completa upload y retorna asset', async () => {
    vi.mocked(customFetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          asset: {
            key: 'posts/asset.webp',
            url: 'https://cdn.example.com/posts/asset.webp',
            mimeType: 'image/webp',
            size: 1024,
            width: 1200,
            height: 800,
          },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      )
    )

    const result = await completeMediaUpload({ uploadId: 'up_1', key: 'posts/asset.webp' })
    expect(result.asset.url).toBe('https://cdn.example.com/posts/asset.webp')
  })

  it('elimina asset por key', async () => {
    vi.mocked(customFetch).mockResolvedValueOnce(new Response(null, { status: 204 }))

    const result = await deleteMediaAsset('posts/asset.webp')

    expect(customFetch).toHaveBeenCalledWith('media/posts%2Fasset.webp', { method: 'DELETE' })
    expect(result).toBe(true)
  })

  it('obtiene metadata de un asset', async () => {
    vi.mocked(customFetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          asset: {
            key: 'posts/asset.webp',
            url: 'https://cdn.example.com/posts/asset.webp',
            mimeType: 'image/webp',
            size: 1024,
          },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      )
    )

    const result = await getMediaAssetMetadata('posts/asset.webp')
    expect(result.asset.key).toBe('posts/asset.webp')
  })
})
