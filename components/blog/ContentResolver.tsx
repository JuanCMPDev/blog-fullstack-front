"use client"

import { useMemo } from "react"
import type { ReactNode } from "react"
import { parseContentV2 } from "@/lib/post-content-v2"
import { PostContentRenderer } from "@/components/blog/PostContentRenderer"

interface ContentResolverProps {
  content: string
  contentV2?: string | null
  renderLegacy: (content: string) => ReactNode
}

export function ContentResolver({ content, contentV2, renderLegacy }: ContentResolverProps) {
  const parsedBlocks = useMemo(() => parseContentV2(contentV2), [contentV2])

  if (parsedBlocks && parsedBlocks.length > 0) {
    return <PostContentRenderer blocks={parsedBlocks} />
  }

  return <>{renderLegacy(content)}</>
}
