import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createLogger } from './logger.js'

const mutableEnv = process.env as Record<string, string | undefined>

describe('logger convention by env', () => {
  const originalNodeEnv = process.env.NODE_ENV
  const originalLogLevel = process.env.NEXT_PUBLIC_APP_LOG_LEVEL

  beforeEach(() => {
    mutableEnv.NODE_ENV = originalNodeEnv
    mutableEnv.NEXT_PUBLIC_APP_LOG_LEVEL = originalLogLevel
    vi.restoreAllMocks()
  })

  it('in development logs debug/info/warn/error', () => {
    mutableEnv.NODE_ENV = 'development'
    delete mutableEnv.NEXT_PUBLIC_APP_LOG_LEVEL

    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const logger = createLogger('test')
    logger.debug('debug')
    logger.info('info')
    logger.warn('warn')
    logger.error('error')

    expect(debugSpy).toHaveBeenCalledTimes(1)
    expect(infoSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledTimes(1)
  })

  it('in production only logs error by default', () => {
    mutableEnv.NODE_ENV = 'production'
    delete mutableEnv.NEXT_PUBLIC_APP_LOG_LEVEL

    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const logger = createLogger('test')
    logger.debug('debug')
    logger.info('info')
    logger.warn('warn')
    logger.error('error')

    expect(debugSpy).not.toHaveBeenCalled()
    expect(infoSpy).not.toHaveBeenCalled()
    expect(warnSpy).not.toHaveBeenCalled()
    expect(errorSpy).toHaveBeenCalledTimes(1)
  })

  it('allows overriding level with NEXT_PUBLIC_APP_LOG_LEVEL', () => {
    mutableEnv.NODE_ENV = 'production'
    mutableEnv.NEXT_PUBLIC_APP_LOG_LEVEL = 'warn'

    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const logger = createLogger('test')
    logger.debug('debug')
    logger.info('info')
    logger.warn('warn')

    expect(debugSpy).not.toHaveBeenCalled()
    expect(infoSpy).not.toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalledTimes(1)
  })
})
