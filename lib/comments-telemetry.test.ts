import { describe, expect, it, vi } from "vitest"
import { createCommentsTelemetry } from "./comments-telemetry.js"

describe("comments telemetry", () => {
  it("emite evento success con duración", () => {
    const emit = vi.fn()
    let nowValue = 1000
    const now = () => nowValue

    const telemetry = createCommentsTelemetry(emit, now)
    const token = telemetry.start("fetch_comments", { page: 1 })

    nowValue = 1225
    telemetry.success(token, { commentsCount: 8 })

    expect(emit).toHaveBeenCalledTimes(1)
    expect(emit).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: "fetch_comments",
        status: "success",
        durationMs: 225,
        context: expect.objectContaining({ page: 1, commentsCount: 8 }),
      })
    )
  })

  it("emite evento error con mensaje seguro", () => {
    const emit = vi.fn()
    const telemetry = createCommentsTelemetry(emit, () => 500)
    const token = telemetry.start("submit_comment")

    telemetry.error(token, new Error("backend failed"))

    expect(emit).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: "submit_comment",
        status: "error",
        errorMessage: "backend failed",
      })
    )
  })

  it("ignora tokens inexistentes", () => {
    const emit = vi.fn()
    const telemetry = createCommentsTelemetry(emit)

    telemetry.success("unknown-token")
    telemetry.error("unknown-token", "boom")

    expect(emit).not.toHaveBeenCalled()
  })
})
