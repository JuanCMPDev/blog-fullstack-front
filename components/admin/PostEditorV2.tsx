"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import {
  IMAGE_VALIDATION_RULES,
  VIDEO_VALIDATION_RULES,
} from "@/lib/media-validation"
import { useMediaUpload } from "@/hooks/use-media-upload"
import {
  createDefaultBlocks,
  extractYouTubeVideoId,
  isSafeYouTubeVideoId,
  parseContentV2,
  serializeContentV2,
  toLegacyMarkdown,
  type PostContentBlock,
  type PostMediaAsset,
} from "@/lib/post-content-v2"
import { GripVertical, ImagePlus, ListPlus, PlayCircle, Type, Video, HelpCircle, Plus, Trash2 } from "lucide-react"

interface PostEditorV2Props {
  initialLegacyContent?: string
  initialContentV2?: string
  onChange: (payload: { legacyContent: string; contentV2: string }) => void
  error?: string
}

function mapUploadedAssetToPostAsset(asset: {
  url: string
  key: string
  type: string
  size?: number
  width?: number
  height?: number
  durationSec?: number
}): PostMediaAsset {
  return {
    url: asset.url,
    key: asset.key,
    mimeType: asset.type,
    size: asset.size || 0,
    width: asset.width,
    height: asset.height,
    durationSec: asset.durationSec,
  }
}

export function PostEditorV2({
  initialLegacyContent = "",
  initialContentV2,
  onChange,
  error = "",
}: PostEditorV2Props) {
  const initialBlocks = useMemo(() => {
    const parsed = parseContentV2(initialContentV2)
    return parsed && parsed.length > 0 ? parsed : createDefaultBlocks(initialLegacyContent)
  }, [initialLegacyContent, initialContentV2])

  const [blocks, setBlocks] = useState<PostContentBlock[]>(initialBlocks)
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const initializedRef = useRef(false)
  const onChangeRef = useRef(onChange)
  const suppressNextEmitRef = useRef(false)
  const lastHydratedSignatureRef = useRef<string | null>(null)
  const lastEmittedContentV2Ref = useRef<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const galleryInputRef = useRef<HTMLInputElement | null>(null)
  const videoInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    const normalizedContentV2 = initialContentV2?.trim() || ""
    const normalizedLegacy = initialLegacyContent?.trim() || ""
    const externalSignature = normalizedContentV2
      ? `v2:${normalizedContentV2}`
      : `legacy:${normalizedLegacy}`

    if (externalSignature === lastHydratedSignatureRef.current) {
      return
    }

    if (normalizedContentV2 && normalizedContentV2 === lastEmittedContentV2Ref.current) {
      lastHydratedSignatureRef.current = externalSignature
      return
    }

    const nextBlocks = normalizedContentV2
      ? parseContentV2(normalizedContentV2) || createDefaultBlocks(normalizedLegacy)
      : createDefaultBlocks(normalizedLegacy)

    suppressNextEmitRef.current = true
    lastHydratedSignatureRef.current = externalSignature
    setBlocks(nextBlocks)
  }, [initialContentV2, initialLegacyContent])

  const imageUpload = useMediaUpload({
    resource: "post-image",
    rules: IMAGE_VALIDATION_RULES,
  })

  const videoUpload = useMediaUpload({
    resource: "post-video",
    rules: VIDEO_VALIDATION_RULES,
  })

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true
      return
    }

    if (suppressNextEmitRef.current) {
      suppressNextEmitRef.current = false
      return
    }

    const contentV2 = serializeContentV2(blocks)
    const legacyContent = toLegacyMarkdown(blocks)
    lastEmittedContentV2Ref.current = contentV2
    onChangeRef.current({ legacyContent, contentV2 })
  }, [blocks])

  const updateBlock = (blockId: string, updater: (block: PostContentBlock) => PostContentBlock) => {
    setBlocks((prev) => prev.map((block) => (block.id === blockId ? updater(block) : block)))
  }

  const reorderBlocks = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return

    setBlocks((prev) => {
      if (fromIndex < 0 || toIndex < 0 || fromIndex >= prev.length || toIndex >= prev.length) {
        return prev
      }

      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
  }, [])

  const handleDragStart = (index: number, event: React.DragEvent<HTMLButtonElement>) => {
    setDragIndex(index)
    setDragOverIndex(index)
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", String(index))
  }

  const handleDragOverCard = (index: number, event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
    if (dragOverIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDropOnCard = (targetIndex: number, event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()

    const sourceFromState = dragIndex
    const sourceFromTransfer = Number(event.dataTransfer.getData("text/plain"))
    const sourceIndex = sourceFromState ?? (Number.isNaN(sourceFromTransfer) ? null : sourceFromTransfer)

    if (sourceIndex !== null) {
      reorderBlocks(sourceIndex, targetIndex)
    }

    setDragIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDragIndex(null)
    setDragOverIndex(null)
  }

  const removeBlock = (blockId: string) => {
    setBlocks((prev) => {
      const next = prev.filter((block) => block.id !== blockId)
      return next.length > 0 ? next : createDefaultBlocks("")
    })
  }

  const addParagraph = () => {
    setBlocks((prev) => [
      ...prev,
      {
        id: `p-${Date.now()}`,
        type: "paragraph",
        text: "",
      },
    ])
  }

  const addHeading = () => {
    setBlocks((prev) => [
      ...prev,
      {
        id: `h-${Date.now()}`,
        type: "heading",
        level: 2,
        text: "",
      },
    ])
  }

  const addQuiz = () => {
    setBlocks((prev) => [
      ...prev,
      {
        id: `quiz-${Date.now()}`,
        type: "quiz",
        question: "",
        options: ["", ""],
        correctIndex: 0,
      },
    ])
  }

  const handleAddYouTube = () => {
    const videoId = extractYouTubeVideoId(youtubeUrl)
    if (!videoId) {
      toast({
        title: "URL inválida",
        description: "Ingresa una URL válida de YouTube.",
        variant: "destructive",
      })
      return
    }

    setBlocks((prev) => [
      ...prev,
      {
        id: `yt-${Date.now()}`,
        type: "videoEmbed",
        provider: "youtube",
        videoId,
      },
    ])
    setYoutubeUrl("")
  }

  const handleImageSelection = async (file: File | null) => {
    if (!file) return

    try {
      const uploaded = await imageUpload.upload(file)
      const asset = mapUploadedAssetToPostAsset(uploaded)
      setBlocks((prev) => [
        ...prev,
        {
          id: `img-${Date.now()}`,
          type: "image",
          asset,
          alt: file.name,
        },
      ])
      toast({ title: "Imagen insertada", description: "La imagen se subió e insertó en el contenido." })
    } catch (uploadError) {
      toast({
        title: "Error de subida",
        description: uploadError instanceof Error ? uploadError.message : "No se pudo subir la imagen.",
        variant: "destructive",
      })
    }
  }

  const handleGallerySelection = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const uploadedItems: PostMediaAsset[] = []

    for (const file of Array.from(files)) {
      try {
        const uploaded = await imageUpload.upload(file)
        uploadedItems.push(mapUploadedAssetToPostAsset(uploaded))
      } catch {
        toast({
          title: "Error de subida",
          description: `No se pudo subir ${file.name}.`,
          variant: "destructive",
        })
      }
    }

    if (uploadedItems.length > 0) {
      setBlocks((prev) => [
        ...prev,
        {
          id: `gallery-${Date.now()}`,
          type: "gallery",
          items: uploadedItems,
        },
      ])
      toast({ title: "Galería insertada", description: `Se insertaron ${uploadedItems.length} imágenes.` })
    }
  }

  const handleVideoSelection = async (file: File | null) => {
    if (!file) return

    try {
      const uploaded = await videoUpload.upload(file)
      const asset = mapUploadedAssetToPostAsset(uploaded)

      setBlocks((prev) => [
        ...prev,
        {
          id: `vid-${Date.now()}`,
          type: "videoFile",
          asset,
          caption: file.name,
        },
      ])
      toast({ title: "Video insertado", description: "El video se subió e insertó en el contenido." })
    } catch (uploadError) {
      toast({
        title: "Error de subida",
        description: uploadError instanceof Error ? uploadError.message : "No se pudo subir el video.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium">Contenido (Editor V2)</label>
        <Badge variant="secondary">Bloques</Badge>
      </div>

      <Card className="p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={addParagraph}>
            <Type className="h-4 w-4 mr-1" /> Párrafo
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={addHeading}>
            <Type className="h-4 w-4 mr-1" /> Título
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => imageInputRef.current?.click()}>
            <ImagePlus className="h-4 w-4 mr-1" /> Imagen
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => galleryInputRef.current?.click()}>
            <ListPlus className="h-4 w-4 mr-1" /> Galería
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => videoInputRef.current?.click()}>
            <Video className="h-4 w-4 mr-1" /> Video
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={addQuiz}>
            <HelpCircle className="h-4 w-4 mr-1" /> Quiz
          </Button>
        </div>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => handleImageSelection(event.target.files?.[0] || null)}
        />

        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => handleGallerySelection(event.target.files)}
        />

        <input
          ref={videoInputRef}
          type="file"
          accept="video/mp4,video/webm"
          className="hidden"
          onChange={(event) => handleVideoSelection(event.target.files?.[0] || null)}
        />

        {(imageUpload.isUploading || videoUpload.isUploading) && (
          <div className="space-y-2">
            {imageUpload.isUploading && (
              <>
                <p className="text-xs text-muted-foreground">Subiendo imagen...</p>
                <Progress value={imageUpload.progress} />
              </>
            )}
            {videoUpload.isUploading && (
              <>
                <p className="text-xs text-muted-foreground">Subiendo video...</p>
                <Progress value={videoUpload.progress} />
              </>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            placeholder="Pega URL de YouTube (watch, embed, shorts o youtu.be)"
            value={youtubeUrl}
            onChange={(event) => setYoutubeUrl(event.target.value)}
          />
          <Button type="button" variant="secondary" onClick={handleAddYouTube}>
            <PlayCircle className="h-4 w-4 mr-1" /> Insertar YT
          </Button>
        </div>
      </Card>

      <div className="space-y-3">
        {blocks.map((block, index) => {
          if (block.type === "paragraph") {
            return (
              <Card
                key={block.id}
                className={`p-3 space-y-2 ${dragOverIndex === index ? "ring-2 ring-primary/40" : ""}`}
                onDragOver={(event) => handleDragOverCard(index, event)}
                onDrop={(event) => handleDropOnCard(index, event)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      draggable
                      onDragStart={(event) => handleDragStart(index, event)}
                      onDragEnd={handleDragEnd}
                      className="cursor-grab active:cursor-grabbing px-2"
                      title="Arrastrar para reordenar"
                      aria-label="Arrastrar para reordenar"
                    >
                      <GripVertical className="h-4 w-4" />
                    </Button>
                    <Badge variant="outline">Párrafo {index + 1}</Badge>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeBlock(block.id)}>
                    Eliminar
                  </Button>
                </div>
                <Textarea
                  value={block.text}
                  onChange={(event) =>
                    updateBlock(block.id, (current) =>
                      current.type === "paragraph" ? { ...current, text: event.target.value } : current
                    )
                  }
                  placeholder="Escribe un párrafo..."
                  className="min-h-[120px]"
                />
              </Card>
            )
          }

          if (block.type === "heading") {
            return (
              <Card
                key={block.id}
                className={`p-3 space-y-2 ${dragOverIndex === index ? "ring-2 ring-primary/40" : ""}`}
                onDragOver={(event) => handleDragOverCard(index, event)}
                onDrop={(event) => handleDropOnCard(index, event)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      draggable
                      onDragStart={(event) => handleDragStart(index, event)}
                      onDragEnd={handleDragEnd}
                      className="cursor-grab active:cursor-grabbing px-2"
                      title="Arrastrar para reordenar"
                      aria-label="Arrastrar para reordenar"
                    >
                      <GripVertical className="h-4 w-4" />
                    </Button>
                    <Badge variant="outline">Título {index + 1}</Badge>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeBlock(block.id)}>
                    Eliminar
                  </Button>
                </div>
                <Input
                  value={block.text}
                  onChange={(event) =>
                    updateBlock(block.id, (current) =>
                      current.type === "heading" ? { ...current, text: event.target.value } : current
                    )
                  }
                  placeholder="Título del bloque"
                />
              </Card>
            )
          }

          if (block.type === "image") {
            return (
              <Card
                key={block.id}
                className={`p-3 space-y-2 ${dragOverIndex === index ? "ring-2 ring-primary/40" : ""}`}
                onDragOver={(event) => handleDragOverCard(index, event)}
                onDrop={(event) => handleDropOnCard(index, event)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      draggable
                      onDragStart={(event) => handleDragStart(index, event)}
                      onDragEnd={handleDragEnd}
                      className="cursor-grab active:cursor-grabbing px-2"
                      title="Arrastrar para reordenar"
                      aria-label="Arrastrar para reordenar"
                    >
                      <GripVertical className="h-4 w-4" />
                    </Button>
                    <Badge variant="outline">Imagen</Badge>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeBlock(block.id)}>
                    Eliminar
                  </Button>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={block.asset.url}
                  alt={block.alt || "Imagen del post"}
                  className="rounded-md w-full max-h-72 object-contain bg-muted/30"
                  loading="lazy"
                />
                <p className="text-xs text-muted-foreground break-all">{block.asset.url}</p>
                <Input
                  value={block.alt || ""}
                  onChange={(event) =>
                    updateBlock(block.id, (current) =>
                      current.type === "image" ? { ...current, alt: event.target.value } : current
                    )
                  }
                  placeholder="Alt de imagen"
                />
              </Card>
            )
          }

          if (block.type === "gallery") {
            return (
              <Card
                key={block.id}
                className={`p-3 space-y-2 ${dragOverIndex === index ? "ring-2 ring-primary/40" : ""}`}
                onDragOver={(event) => handleDragOverCard(index, event)}
                onDrop={(event) => handleDropOnCard(index, event)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      draggable
                      onDragStart={(event) => handleDragStart(index, event)}
                      onDragEnd={handleDragEnd}
                      className="cursor-grab active:cursor-grabbing px-2"
                      title="Arrastrar para reordenar"
                      aria-label="Arrastrar para reordenar"
                    >
                      <GripVertical className="h-4 w-4" />
                    </Button>
                    <Badge variant="outline">Galería ({block.items.length})</Badge>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeBlock(block.id)}>
                    Eliminar
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{block.items.length} imágenes cargadas</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {block.items.map((item, itemIndex) => (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      key={`${block.id}-${item.key}-${itemIndex}`}
                      src={item.url}
                      alt={`Imagen ${itemIndex + 1}`}
                      className="rounded-md w-full h-28 object-cover bg-muted/30"
                      loading="lazy"
                    />
                  ))}
                </div>
              </Card>
            )
          }

          if (block.type === "videoEmbed") {
            const embedUrl = `https://www.youtube.com/embed/${block.videoId}`

            return (
              <Card
                key={block.id}
                className={`p-3 space-y-2 ${dragOverIndex === index ? "ring-2 ring-primary/40" : ""}`}
                onDragOver={(event) => handleDragOverCard(index, event)}
                onDrop={(event) => handleDropOnCard(index, event)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      draggable
                      onDragStart={(event) => handleDragStart(index, event)}
                      onDragEnd={handleDragEnd}
                      className="cursor-grab active:cursor-grabbing px-2"
                      title="Arrastrar para reordenar"
                      aria-label="Arrastrar para reordenar"
                    >
                      <GripVertical className="h-4 w-4" />
                    </Button>
                    <Badge variant="outline">YouTube</Badge>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeBlock(block.id)}>
                    Eliminar
                  </Button>
                </div>
                {isSafeYouTubeVideoId(block.videoId) ? (
                  <>
                    <div className="relative w-full overflow-hidden rounded-md bg-muted/30" style={{ paddingTop: "56.25%" }}>
                      <iframe
                        src={embedUrl}
                        title="Preview de YouTube"
                        className="absolute inset-0 h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-destructive">Video ID inválido para preview de YouTube.</p>
                )}
                <p className="text-xs text-muted-foreground">Video ID: {block.videoId}</p>
              </Card>
            )
          }

          if (block.type === "quiz") {
            return (
              <Card
                key={block.id}
                className={`p-3 space-y-3 ${dragOverIndex === index ? "ring-2 ring-primary/40" : ""}`}
                onDragOver={(event) => handleDragOverCard(index, event)}
                onDrop={(event) => handleDropOnCard(index, event)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      draggable
                      onDragStart={(event) => handleDragStart(index, event)}
                      onDragEnd={handleDragEnd}
                      className="cursor-grab active:cursor-grabbing px-2"
                      title="Arrastrar para reordenar"
                      aria-label="Arrastrar para reordenar"
                    >
                      <GripVertical className="h-4 w-4" />
                    </Button>
                    <Badge variant="outline">
                      <HelpCircle className="h-3 w-3 mr-1" />
                      Quiz ({block.options.length} opciones)
                    </Badge>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeBlock(block.id)}>
                    Eliminar
                  </Button>
                </div>

                {/* Question */}
                <Input
                  value={block.question}
                  onChange={(event) =>
                    updateBlock(block.id, (current) =>
                      current.type === "quiz" ? { ...current, question: event.target.value } : current
                    )
                  }
                  placeholder="Escribe la pregunta..."
                />

                {/* Options */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Opciones de respuesta</label>
                  {block.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateBlock(block.id, (current) =>
                            current.type === "quiz" ? { ...current, correctIndex: optIndex } : current
                          )
                        }
                        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                          block.correctIndex === optIndex
                            ? "bg-green-500 text-white border-green-500"
                            : "border-border/50 text-muted-foreground hover:border-green-500/50"
                        }`}
                        title={block.correctIndex === optIndex ? "Respuesta correcta" : "Marcar como correcta"}
                      >
                        {String.fromCharCode(65 + optIndex)}
                      </button>
                      <Input
                        value={option}
                        onChange={(event) =>
                          updateBlock(block.id, (current) => {
                            if (current.type !== "quiz") return current
                            const newOptions = [...current.options]
                            newOptions[optIndex] = event.target.value
                            return { ...current, options: newOptions }
                          })
                        }
                        placeholder={`Opción ${String.fromCharCode(65 + optIndex)}`}
                        className="flex-1"
                      />
                      {block.options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 flex-shrink-0"
                          onClick={() =>
                            updateBlock(block.id, (current) => {
                              if (current.type !== "quiz") return current
                              const newOptions = current.options.filter((_, i) => i !== optIndex)
                              const newCorrect =
                                current.correctIndex === optIndex
                                  ? 0
                                  : current.correctIndex > optIndex
                                  ? current.correctIndex - 1
                                  : current.correctIndex
                              return { ...current, options: newOptions, correctIndex: newCorrect }
                            })
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {block.options.length < 6 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateBlock(block.id, (current) =>
                          current.type === "quiz"
                            ? { ...current, options: [...current.options, ""] }
                            : current
                        )
                      }
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Agregar opción
                    </Button>
                  )}
                </div>

                {/* Explanation */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Explicación (opcional)</label>
                  <Textarea
                    value={block.explanation || ""}
                    onChange={(event) =>
                      updateBlock(block.id, (current) =>
                        current.type === "quiz" ? { ...current, explanation: event.target.value } : current
                      )
                    }
                    placeholder="Explicación que se muestra al responder..."
                    className="min-h-[60px] mt-1"
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  Haz clic en la letra para marcar la respuesta correcta. Mín. 2, máx. 6 opciones.
                </p>
              </Card>
            )
          }

          return (
            <Card
              key={block.id}
              className={`p-3 space-y-2 ${dragOverIndex === index ? "ring-2 ring-primary/40" : ""}`}
              onDragOver={(event) => handleDragOverCard(index, event)}
              onDrop={(event) => handleDropOnCard(index, event)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    draggable
                    onDragStart={(event) => handleDragStart(index, event)}
                    onDragEnd={handleDragEnd}
                    className="cursor-grab active:cursor-grabbing px-2"
                    title="Arrastrar para reordenar"
                    aria-label="Arrastrar para reordenar"
                  >
                    <GripVertical className="h-4 w-4" />
                  </Button>
                  <Badge variant="outline">Video subido</Badge>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeBlock(block.id)}>
                  Eliminar
                </Button>
              </div>
              <video controls className="w-full rounded-md bg-muted/30" preload="metadata" src={block.asset.url}>
                Tu navegador no soporta video HTML5.
              </video>
              <p className="text-xs text-muted-foreground break-all">{block.asset.url}</p>
            </Card>
          )
        })}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
