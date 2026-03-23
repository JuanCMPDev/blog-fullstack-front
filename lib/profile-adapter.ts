import { UserRole, type UserProfile } from './types'

type MaybeObject = Record<string, unknown>

function isObject(value: unknown): value is MaybeObject {
  return typeof value === 'object' && value !== null
}

function extractString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function normalizeUrl(value?: string): string | undefined {
  if (!value) return undefined
  if (/^https?:\/\//i.test(value)) return value
  return undefined
}

function buildSocialUrl(prefix: string, value?: string): string | undefined {
  if (!value) return undefined
  const absolute = normalizeUrl(value)
  if (absolute) return absolute

  const sanitized = value.replace(/^@+/, '').trim()
  if (!sanitized) return undefined
  return `${prefix}${sanitized}`
}

export function extractProfileFromPayload(payload: unknown): MaybeObject {
  if (!isObject(payload)) return {}

  const nestedData = isObject(payload.data) ? payload.data : null
  if (nestedData) return nestedData

  const nestedUser = isObject(payload.user) ? payload.user : null
  if (nestedUser) return nestedUser

  const nestedProfile = isObject(payload.profile) ? payload.profile : null
  if (nestedProfile) return nestedProfile

  return payload
}

function extractRole(value: unknown): UserRole {
  if (value === UserRole.Admin || value === UserRole.Editor || value === UserRole.User) {
    return value
  }
  if (typeof value === 'string') {
    const normalized = value.toLowerCase()
    if (normalized === UserRole.Admin) return UserRole.Admin
    if (normalized === UserRole.Editor) return UserRole.Editor
    if (normalized === UserRole.User) return UserRole.User
  }
  return UserRole.User
}

function extractStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

function extractSocialLinks(profile: MaybeObject): UserProfile['socialLinks'] {
  const nestedSocial = isObject(profile.socialLinks) ? profile.socialLinks : null

  const twitter = extractString(nestedSocial?.twitter) ?? extractString(profile.twitter)
  const github = extractString(nestedSocial?.github) ?? extractString(profile.github)
  const linkedin = extractString(nestedSocial?.linkedin) ?? extractString(profile.linkedin)

  return {
    ...(twitter ? { twitter } : {}),
    ...(github ? { github } : {}),
    ...(linkedin ? { linkedin } : {}),
  }
}

export function normalizeProfilePayload(payload: unknown): UserProfile {
  const profile = extractProfileFromPayload(payload)

  const avatar = extractString(profile.avatar) ?? extractString(profile.avatarUrl) ?? ''
  const coverImage = extractString(profile.coverImage) ?? extractString(profile.coverImageUrl) ?? ''

  return {
    userId: extractString(profile.userId) ?? extractString(profile.id) ?? '',
    name: extractString(profile.name) ?? '',
    bio: extractString(profile.bio) ?? '',
    email: extractString(profile.email) ?? '',
    nick: extractString(profile.nick) ?? '',
    role: extractRole(profile.role),
    avatar,
    coverImage,
    location: extractString(profile.location) ?? '',
    joinDate: extractString(profile.joinDate) ?? extractString(profile.createdAt) ?? '',
    socialLinks: extractSocialLinks(profile),
    skills: extractStringArray(profile.skills),
  }
}

export function extractAvatarUrlFromPayload(payload: unknown): string | null {
  const profile = extractProfileFromPayload(payload)

  const direct = extractString(profile.avatarUrl) ?? extractString(profile.avatar)
  if (direct) return direct

  const nestedUser = isObject(profile.user) ? profile.user : null
  if (!nestedUser) return null

  return extractString(nestedUser.avatarUrl) ?? extractString(nestedUser.avatar)
}

type SocialLinksInput = {
  twitter?: string
  github?: string
  linkedin?: string
}

type ProfileInput = {
  name?: string
  bio?: string
  location?: string
  skills?: string[]
  socialLinks?: SocialLinksInput
}

export function buildProfileUpdatePayload(profile: ProfileInput): MaybeObject {
  const payload: MaybeObject = {
    name: profile.name,
    bio: profile.bio,
    location: profile.location,
    skills: Array.isArray(profile.skills) ? profile.skills : [],
  }

  const twitter = buildSocialUrl('https://twitter.com/', profile.socialLinks?.twitter)
  const github = buildSocialUrl('https://github.com/', profile.socialLinks?.github)
  const linkedin = buildSocialUrl('https://linkedin.com/in/', profile.socialLinks?.linkedin)

  if (twitter) payload.twitter = twitter
  if (github) payload.github = github
  if (linkedin) payload.linkedin = linkedin

  return payload
}
