"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Upload, Pencil } from "lucide-react"
import { getAvatarUrl } from "@/lib/utils"

interface AvatarEditProps {
  currentAvatar: string
  onAvatarChange: (newAvatar: File) => void
  handleAvatarUpdate: () => void
}

export function AvatarEdit({ currentAvatar, onAvatarChange, handleAvatarUpdate }: AvatarEditProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [newAvatar, setNewAvatar] = useState<string | null>(null)

  // Convertir el avatar actual a URL de CloudFront
  const avatarUrl = getAvatarUrl(currentAvatar)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    console.log(file)
    if (file) {
      setNewAvatar(URL.createObjectURL(file)) // Para previsualización
      onAvatarChange(file) // Pasar el archivo al padre
    }
  }

  const handleSave = async () => {
    await handleAvatarUpdate()
    setIsOpen(false)
  }

  const handleAvatarClick = () => {
    document.getElementById("fileInput")?.click()
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="absolute bottom-0 right-0 rounded-full bg-background/80 p-1 backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100"
        onClick={() => setIsOpen(true)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <AnimatePresence>
        {isOpen && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px] w-[95vw] max-w-[95vw] sm:w-full">
              <DialogHeader>
                <DialogTitle className="text-center">Editar Avatar</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex justify-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    className="relative group cursor-pointer"
                    onClick={handleAvatarClick}
                  >
                    <Avatar className="w-32 h-32 sm:w-40 sm:h-40">
                      <AvatarImage src={newAvatar || avatarUrl} />
                      <AvatarFallback>Avatar</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full">
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <input
                          id="fileInput"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                        <Upload className="h-8 w-8 text-white" />
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
                <p className="text-center text-sm text-muted-foreground mt-2">
                  Haz clic en la imagen para cambiar tu avatar
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

