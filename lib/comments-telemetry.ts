type CommentOperation =
  | "fetch_comments"
  | "submit_comment"
  | "submit_reply"

export interface CommentsTelemetryEvent {
  operation: CommentOperation
  status: "success" | "error"
  durationMs: number
  context?: Record<string, unknown>
  errorMessage?: string
}

type ActiveOperation = {
  operation: CommentOperation
  startedAt: number
  context?: Record<string, unknown>
}

const defaultNow = () => Date.now()

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  return "unknown error"
}

export function createCommentsTelemetry(
  emit: (event: CommentsTelemetryEvent) => void,
  now: () => number = defaultNow
) {
  const active = new Map<string, ActiveOperation>()

  const start = (
    operation: CommentOperation,
    context?: Record<string, unknown>
  ): string => {
    const token = `${operation}-${now()}-${Math.random().toString(36).slice(2)}`
    active.set(token, {
      operation,
      startedAt: now(),
      context,
    })
    return token
  }

  const success = (token: string, context?: Record<string, unknown>) => {
    const operation = active.get(token)
    if (!operation) return

    const durationMs = Math.max(0, now() - operation.startedAt)
    emit({
      operation: operation.operation,
      status: "success",
      durationMs,
      context: {
        ...(operation.context ?? {}),
        ...(context ?? {}),
      },
    })

    active.delete(token)
  }

  const error = (token: string, rawError: unknown, context?: Record<string, unknown>) => {
    const operation = active.get(token)
    if (!operation) return

    const durationMs = Math.max(0, now() - operation.startedAt)
    emit({
      operation: operation.operation,
      status: "error",
      durationMs,
      errorMessage: getErrorMessage(rawError),
      context: {
        ...(operation.context ?? {}),
        ...(context ?? {}),
      },
    })

    active.delete(token)
  }

  return {
    start,
    success,
    error,
  }
}
