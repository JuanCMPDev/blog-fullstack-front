"use client"

import { AlertCircle } from "lucide-react"
import { isSafeYouTubeVideoId, type PostContentBlock } from "@/lib/post-content-v2"
import { QuizBlockView } from "@/components/blog/QuizBlockView"

interface PostContentRendererProps {
  blocks: PostContentBlock[]
}

export function PostContentRenderer({ blocks }: PostContentRendererProps) {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none mb-8 space-y-4 text-left break-words">
      {blocks.map((block) => {
        if (block.type === "paragraph") {
          return <p key={block.id}>{block.text}</p>
        }

        if (block.type === "heading") {
          if (block.level === 1) return <h1 key={block.id}>{block.text}</h1>
          if (block.level === 2) return <h2 key={block.id}>{block.text}</h2>
          return <h3 key={block.id}>{block.text}</h3>
        }

        if (block.type === "image") {
          return (
            <figure key={block.id} className="my-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={block.asset.url}
                alt={block.alt || "Imagen"}
                className="rounded-lg max-w-full mx-auto"
                loading="lazy"
              />
              {block.caption ? <figcaption className="text-center text-sm mt-2">{block.caption}</figcaption> : null}
            </figure>
          )
        }

        if (block.type === "gallery") {
          return (
            <figure key={block.id} className="my-4 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {block.items.map((item, index) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={`${block.id}-${item.key}-${index}`}
                    src={item.url}
                    alt={`Imagen ${index + 1}`}
                    className="rounded-lg w-full h-auto"
                    loading="lazy"
                  />
                ))}
              </div>
              {block.caption ? <figcaption className="text-center text-sm">{block.caption}</figcaption> : null}
            </figure>
          )
        }

        if (block.type === "videoEmbed") {
          if (!isSafeYouTubeVideoId(block.videoId)) {
            return (
              <div key={block.id} className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>Embed de YouTube inválido o no permitido.</span>
                </div>
              </div>
            )
          }

          const embedUrl = `https://www.youtube.com/embed/${block.videoId}`

          return (
            <div key={block.id} className="my-4">
              <div className="relative w-full overflow-hidden rounded-lg" style={{ paddingTop: "56.25%" }}>
                <iframe
                  src={embedUrl}
                  title={block.title || "Video de YouTube"}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            </div>
          )
        }

        if (block.type === "quiz") {
          return <QuizBlockView key={block.id} block={block} />
        }

        return (
          <figure key={block.id} className="my-4 space-y-2">
            <video controls className="w-full rounded-lg" preload="metadata" src={block.asset.url}>
              Tu navegador no soporta video HTML5.
            </video>
            {block.caption ? <figcaption className="text-center text-sm">{block.caption}</figcaption> : null}
          </figure>
        )
      })}
    </div>
  )
}
