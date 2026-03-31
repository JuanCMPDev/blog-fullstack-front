"use client"

import { Fragment } from "react"

interface InlineMarkdownProps {
  text: string
  className?: string
}

type InlineNode =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "italic"; value: string }
  | { type: "code"; value: string }
  | { type: "link"; text: string; href: string }

/**
 * Parsea inline markdown: **bold**, *italic*, `code`, [text](url)
 * No soporta bloques (headings, listas, etc.) — solo formato inline.
 */
function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = []
  // Regex que captura: links, bold, italic, inline code
  const regex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|`([^`]+)`|\*\*(.+?)\*\*|\*(.+?)\*/g

  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    // Texto plano antes del match
    if (match.index > lastIndex) {
      nodes.push({ type: "text", value: text.slice(lastIndex, match.index) })
    }

    if (match[1] && match[2]) {
      // [text](url)
      nodes.push({ type: "link", text: match[1], href: match[2] })
    } else if (match[3]) {
      // `code`
      nodes.push({ type: "code", value: match[3] })
    } else if (match[4]) {
      // **bold**
      nodes.push({ type: "bold", value: match[4] })
    } else if (match[5]) {
      // *italic*
      nodes.push({ type: "italic", value: match[5] })
    }

    lastIndex = match.index + match[0].length
  }

  // Texto restante
  if (lastIndex < text.length) {
    nodes.push({ type: "text", value: text.slice(lastIndex) })
  }

  return nodes
}

export function InlineMarkdown({ text, className }: InlineMarkdownProps) {
  // Si no tiene marcadores markdown, renderizar como texto plano (rápido)
  if (!/[[\]`*]/.test(text)) {
    return <>{text}</>
  }

  const nodes = parseInline(text)

  return (
    <span className={className}>
      {nodes.map((node, i) => {
        switch (node.type) {
          case "text":
            return <Fragment key={i}>{node.value}</Fragment>
          case "bold":
            return <strong key={i}>{node.value}</strong>
          case "italic":
            return <em key={i}>{node.value}</em>
          case "code":
            return <code key={i} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{node.value}</code>
          case "link":
            return (
              <a
                key={i}
                href={node.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
              >
                {node.text}
              </a>
            )
        }
      })}
    </span>
  )
}
