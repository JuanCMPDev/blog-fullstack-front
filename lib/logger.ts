type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

function parseLogLevel(value: string | undefined): LogLevel | null {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  if (normalized === 'debug' || normalized === 'info' || normalized === 'warn' || normalized === 'error') {
    return normalized
  }
  return null
}

function getCurrentLogLevel(): LogLevel {
  const fromEnv = parseLogLevel(process.env.NEXT_PUBLIC_APP_LOG_LEVEL)
  if (fromEnv) return fromEnv

  if (process.env.NODE_ENV === 'production') {
    return 'error'
  }

  return 'debug'
}

function shouldLog(level: LogLevel): boolean {
  const current = getCurrentLogLevel()
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[current]
}

function formatScope(scope: string): string {
  return `[${scope}]`
}

export function createLogger(scope: string) {
  const prefix = formatScope(scope)

  return {
    debug: (...args: unknown[]) => {
      if (!shouldLog('debug')) return
      console.debug(prefix, ...args)
    },
    info: (...args: unknown[]) => {
      if (!shouldLog('info')) return
      console.info(prefix, ...args)
    },
    warn: (...args: unknown[]) => {
      if (!shouldLog('warn')) return
      console.warn(prefix, ...args)
    },
    error: (...args: unknown[]) => {
      if (!shouldLog('error')) return
      console.error(prefix, ...args)
    },
  }
}
