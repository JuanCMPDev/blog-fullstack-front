"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import Image from "next/image"
import { Upload } from "lucide-react"

interface CoverImageEditProps {
  currentCoverImage: string
  onChange: (newCoverImage: File) => void
  handleCoverImageUpdate: () => void
}

export function CoverImageEdit({ currentCoverImage, onChange, handleCoverImageUpdate }: CoverImageEditProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [newCoverImage, setNewCoverImage] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setNewCoverImage(URL.createObjectURL(file)) // Previsualización
      onChange(file) // Pasar el archivo al componente padre
    }
  }

  const handleSave = async () => {
    await handleCoverImageUpdate() // Actualizar la imagen en el servidor
    setIsOpen(false)
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100"
        onClick={() => setIsOpen(true)}
      >
        <Pencil className="h-4 w-4" />
        <span className="sr-only">Editar imagen de portada</span>
      </Button>
      <AnimatePresence>
        {isOpen && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[725px] w-[95vw] max-w-[95vw] sm:w-full">
              <DialogHeader>
                <DialogTitle className="text-center">Editar Imagen de Portada</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <motion.div
                  className="relative h-48 w-full sm:h-64 md:h-80"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => document.getElementById('coverFileInput')?.click()}
                >
                  <Image
                    src={newCoverImage || currentCoverImage}
                    alt="Cover"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-md">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Upload className="h-8 w-8 text-white" />
                    </motion.div>
                  </div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <input
                    id="coverFileInput"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </motion.div>
                <p className="text-center text-sm text-muted-foreground mt-2">
                  Haz clic en la imagen para seleccionar una nueva imagen de portada
                </p>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  Guardar cambios
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  )
}