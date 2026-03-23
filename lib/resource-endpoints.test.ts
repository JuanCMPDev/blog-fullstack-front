import { describe, expect, it } from 'vitest'
import {
  buildUserStatusEndpoint,
  buildUserStatusPayload,
  buildPostLikeEndpoint,
  buildCommentLikeEndpoint,
  buildPostCommentsEndpoint,
  getLikeHttpMethod,
} from './resource-endpoints'

describe('resource endpoints', () => {
  it('construye endpoint de status de usuario', () => {
    expect(buildUserStatusEndpoint('abc-123')).toBe('users/abc-123/status')
  })

  it('construye payload de status de usuario', () => {
    expect(buildUserStatusPayload(true)).toEqual({ isBanned: true })
    expect(buildUserStatusPayload(false)).toEqual({ isBanned: false })
  })

  it('construye endpoint de likes para post', () => {
    expect(buildPostLikeEndpoint(99)).toBe('posts/99/like')
  })

  it('construye endpoint de likes para comentario', () => {
    expect(buildCommentLikeEndpoint('cmt-1')).toBe('comments/cmt-1/like')
  })

  it('define método HTTP correcto para like/unlike', () => {
    expect(getLikeHttpMethod(false)).toBe('PUT')
    expect(getLikeHttpMethod(true)).toBe('DELETE')
  })

  it('construye endpoint de comentarios de post con query', () => {
    const endpoint = buildPostCommentsEndpoint(12, {
      page: 2,
      limit: 10,
      order: 'likes_desc',
    })

    expect(endpoint).toBe('posts/12/comments/nested?page=2&limit=10&order=likes_desc')
  })
})
