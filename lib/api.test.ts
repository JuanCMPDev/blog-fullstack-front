import { describe, expect, it, beforeEach } from 'vitest'
import { buildApiUrl, extractApiErrorMessage } from './api'

describe('buildApiUrl', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001/api/v1'
  })

  it('concatena base y path relativo sin duplicar slashes', () => {
    expect(buildApiUrl('auth/login')).toBe('http://localhost:3001/api/v1/auth/login')
  })

  it('soporta path con slash inicial', () => {
    expect(buildApiUrl('/auth/login')).toBe('http://localhost:3001/api/v1/auth/login')
  })

  it('evita duplicar /api/v1 cuando base ya lo incluye', () => {
    expect(buildApiUrl('/api/v1/auth/login')).toBe('http://localhost:3001/api/v1/auth/login')
  })
})

describe('extractApiErrorMessage', () => {
  it('extrae message string', () => {
    expect(extractApiErrorMessage({ message: 'Error simple' })).toBe('Error simple')
  })

  it('extrae message array y los concatena', () => {
    expect(extractApiErrorMessage({ message: ['campo requerido', 'email inválido'] })).toBe('campo requerido, email inválido')
  })

  it('usa fallback para payload desconocido', () => {
    expect(extractApiErrorMessage({ foo: 'bar' }, 'Error genérico')).toBe('Error genérico')
  })
})
