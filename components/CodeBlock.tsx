"use client"

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism"

interface CodeBlockProps {
  language: string
  value: string
}

export function CodeBlock({ language, value }: CodeBlockProps) {
  return (
    <div className="relative overflow-x-auto max-w-full">
      <SyntaxHighlighter
        language={language}
        style={tomorrow}
        showLineNumbers={true}
        wrapLines={true}
        customStyle={{
          margin: "0.5em 0",
          padding: "0.5em",
          borderRadius: "0.25em",
          fontSize: "0.7em",
          lineHeight: "1.4",
          maxWidth: "100%",
        }}
        codeTagProps={{
          style: {
            fontFamily: "var(--font-mono)",
            fontSize: "inherit",
            lineHeight: "inherit",
          },
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  )
}

