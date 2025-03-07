import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ImageIcon, X } from "lucide-react"
import type React from "react"

interface SimpleCoverImageUploadProps {
  currentImage: string | null
  previewImage: string | null
  onImageChange: (file: File | null) => void
  onRemoveImage?: () => void
  error?: string
}

export function SimpleCoverImageUpload({
  currentImage,
  previewImage,
  onImageChange,
  onRemoveImage,
  error = ""
}: SimpleCoverImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        onImageChange(file)
      }
    },
    [onImageChange]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]

      if (file?.type.startsWith("image/")) {
        onImageChange(file)
      }
    },
    [onImageChange]
  )

  const handleRemoveImage = useCallback(() => {
    if (onRemoveImage) {
      onRemoveImage()
    } else {
      onImageChange(null)
    }
    
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }, [onImageChange, onRemoveImage])

  // Determinar qué imagen mostrar: primero la previsualización, luego la imagen actual
  const displayImage = previewImage || currentImage

  return (
    <div>
      <label htmlFor="coverImage" className="block text-sm font-medium mb-2">
        Imagen de Portada
      </label>
      <div
        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-border"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-2 text-center">
          {displayImage ? (
            <div className="relative inline-block">
              <img
                src={displayImage}
                alt="Vista previa"
                className="max-h-48 w-auto rounded-lg shadow-md"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <ImageIcon className="h-6 w-6 text-primary" />
              </div>
              <div className="mt-4 flex text-sm text-muted-foreground">
                <label
                  htmlFor="coverImage"
                  className="relative cursor-pointer rounded-md font-semibold text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
                >
                  <span>Sube una imagen</span>
                  <input
                    id="coverImage"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    ref={inputRef}
                    onChange={handleImageChange}
                  />
                </label>
                <p className="pl-1">o arrastra y suelta</p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">PNG, JPG, GIF hasta 10MB</p>
            </div>
          )}
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  )
} 