import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ImageIcon, X } from "lucide-react"
import type React from "react"
import { UseFormRegister } from "react-hook-form"
import { PostFormData } from "@/lib/types"

interface CoverImageUploadProps {
  coverImagePreview: string | null
  setCoverImagePreview: (preview: string | null) => void
  error?: string
  register: UseFormRegister<PostFormData>
}

export function CoverImageUpload({
  coverImagePreview,
  setCoverImagePreview,
  error = "",
  register,
}: CoverImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  // Extraemos onChange y ref de register para el campo "coverImage"
  const { ref, onChange: registerOnChange, ...rest } = register("coverImage")

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        // Generar URL de preview directamente sin convertir a base64
        const previewUrl = URL.createObjectURL(file)
        setCoverImagePreview(previewUrl)
        // Llamar al onChange de react-hook-form para almacenar el archivo
        registerOnChange(e)
      }
    },
    [setCoverImagePreview, registerOnChange]
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
        // Generar URL de preview
        const previewUrl = URL.createObjectURL(file)
        setCoverImagePreview(previewUrl)

        // Crear nuevo FileList artificial y actualizar el input
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        if (inputRef.current) {
          inputRef.current.files = dataTransfer.files
          // Disparar evento change para actualizar react-hook-form
          const changeEvent = new Event("change", { bubbles: true })
          inputRef.current.dispatchEvent(changeEvent)
        }
      }
    },
    [setCoverImagePreview]
  )

  return (
    <div>
      <label htmlFor="coverImage" className="block text-sm font-medium mb-2">
        Imagen de Portada
      </label>
      <div
        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-border"
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-2 text-center">
          {coverImagePreview ? (
            <div className="relative inline-block">
              <img
                src={coverImagePreview}
                alt="Cover preview"
                className="max-h-48 w-auto rounded-lg shadow-md"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={() => {
                  setCoverImagePreview(null)
                  if (inputRef.current) {
                    inputRef.current.value = ""
                    const changeEvent = new Event("change", { bubbles: true })
                    inputRef.current.dispatchEvent(changeEvent)
                  }
                }}
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
                    {...rest}
                    ref={(e) => {
                      ref(e)
                      inputRef.current = e
                    }}
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
