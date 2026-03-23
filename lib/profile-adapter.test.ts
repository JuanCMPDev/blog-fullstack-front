import { describe, expect, it } from 'vitest'
import {
  buildProfileUpdatePayload,
  extractAvatarUrlFromPayload,
  extractProfileFromPayload,
  normalizeProfilePayload,
} from './profile-adapter'
import { UserRole } from './types'

describe('profile-adapter', () => {
  it('construye payload de update solo con campos editables', () => {
    const payload = buildProfileUpdatePayload({
      name: 'Juan',
      bio: 'Bio',
      location: '🇨🇴 Colombia',
      skills: ['ts', 'react'],
      socialLinks: {
        twitter: 'juan_dev',
        github: 'juancmunoz',
        linkedin: 'juan-munoz',
      },
      email: 'ignored@example.com',
      role: 'admin',
      avatar: '/avatars/a.png',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    expect(payload).toEqual({
      name: 'Juan',
      bio: 'Bio',
      location: '🇨🇴 Colombia',
      skills: ['ts', 'react'],
      twitter: 'https://twitter.com/juan_dev',
      github: 'https://github.com/juancmunoz',
      linkedin: 'https://linkedin.com/in/juan-munoz',
    })
    expect(payload).not.toHaveProperty('email')
    expect(payload).not.toHaveProperty('role')
    expect(payload).not.toHaveProperty('avatar')
  })

  it('extrae avatar desde distintas respuestas del backend', () => {
    expect(extractAvatarUrlFromPayload({ avatarUrl: '/avatars/a.webp' })).toBe('/avatars/a.webp')
    expect(extractAvatarUrlFromPayload({ avatar: '/avatars/b.webp' })).toBe('/avatars/b.webp')
    expect(extractAvatarUrlFromPayload({ data: { avatarUrl: '/avatars/c.webp' } })).toBe('/avatars/c.webp')
    expect(extractAvatarUrlFromPayload({ user: { avatar: '/avatars/d.webp' } })).toBe('/avatars/d.webp')
  })

  it('extrae perfil desde payload envuelto o plano', () => {
    const wrapped = { data: { userId: '1', name: 'Juan' } }
    const plain = { userId: '2', name: 'Ana' }

    expect(extractProfileFromPayload(wrapped)).toEqual({ userId: '1', name: 'Juan' })
    expect(extractProfileFromPayload(plain)).toEqual({ userId: '2', name: 'Ana' })
  })

  it('normaliza avatar y coverImage cuando backend usa avatarUrl/coverImageUrl', () => {
    const normalized = normalizeProfilePayload({
      data: {
        userId: '3',
        name: 'Pedro',
        avatarUrl: '/avatars/pedro.webp',
        coverImageUrl: '/covers/pedro.webp',
      },
    })

    expect(normalized.avatar).toBe('/avatars/pedro.webp')
    expect(normalized.coverImage).toBe('/covers/pedro.webp')
  })

  it('normaliza un perfil incompleto a UserProfile con defaults seguros', () => {
    const normalized = normalizeProfilePayload({
      data: {
        userId: '99',
        name: 'Tester',
      },
    })

    expect(normalized).toMatchObject({
      userId: '99',
      name: 'Tester',
      bio: '',
      email: '',
      nick: '',
      role: UserRole.User,
      avatar: '',
      coverImage: '',
      location: '',
      joinDate: '',
      socialLinks: {},
      skills: [],
    })
  })
})
