import { beforeEach, describe, expect, it } from 'vitest'
import { getAvatarUrl } from './utils'

describe('getAvatarUrl', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_MEDIA_URL = 'https://cdn.example.com'
  })

  it('retorna placeholder cuando no hay avatar', () => {
    expect(getAvatarUrl('')).toBe('/profile.jpg')
  })

  it('respeta URL absoluta', () => {
    expect(getAvatarUrl('https://media.example.com/avatar.webp')).toBe('https://media.example.com/avatar.webp')
  })

  it('construye URL completa desde ruta relativa con NEXT_PUBLIC_MEDIA_URL', () => {
    expect(getAvatarUrl('/avatars/user-1.webp')).toBe('https://cdn.example.com/avatars/user-1.webp')
  })
})
