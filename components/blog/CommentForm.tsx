import React, { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface CommentFormProps {
  onSubmitComment: (content: string) => Promise<boolean | undefined>
  isLoading?: boolean
}

const CommentForm: React.FC<CommentFormProps> = ({ onSubmitComment, isLoading: externalLoading = false }) => {
  const [newComment, setNewComment] = useState("")
  const [internalSubmitting, setInternalSubmitting] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  
  // Estado compuesto que combina el estado de carga externo e interno
  const submittingComment = internalSubmitting || externalLoading;
  
  // Efecto para limpiar el formulario si el estado externo cambia a no cargando
  useEffect(() => {
    // Si estaba cargando y ha terminado, podemos considerar resetear
    if (!externalLoading && internalSubmitting) {
      setInternalSubmitting(false);
    }
  }, [externalLoading, internalSubmitting]);

  const handleNewComment = async () => {
    if (!user) {
      toast({
        title: "Inicio de sesión requerido",
        description: "Debes iniciar sesión para comentar.",
        variant: "destructive",
      })
      return
    }
    
    if (!newComment.trim()) return
    if (submittingComment) return // No permitir múltiples envíos

    setInternalSubmitting(true)
    try {
      const success = await onSubmitComment(newComment)
      if (success) {
        setNewComment("")
      }
    } catch (error) {
      console.error("Error al enviar el comentario:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar el comentario. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      // Asegurarnos de que nuestro estado interno siempre se actualice
      setInternalSubmitting(false)
    }
  }

  // Manejar tecla Enter para enviar comentario
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey && !submittingComment && newComment.trim()) {
      e.preventDefault();
      handleNewComment();
    }
  };

  if (!user) {
    return (
      <div className="mb-6 text-center">
        <p className="text-muted-foreground mb-2">Inicia sesión para dejar un comentario.</p>
        <Button variant="outline" asChild>
          <Link href="/signin">Iniciar sesión</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <div className="flex items-start space-x-4">
        <Avatar className="w-10 h-10">
          <AvatarImage src={user.avatar || "/placeholder.svg?height=40&width=40"} alt={typeof user.name === 'string' ? user.name : 'Usuario'} />
          <AvatarFallback>{typeof user.name === 'string' && user.name.length > 0 ? user.name.charAt(0) : 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <Textarea
            placeholder="Escribe un comentario..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            className="mb-2 min-h-[100px] resize-none bg-gradient-to-br from-accent/40 to-secondary/20 rounded-lg shadow-sm"
            disabled={submittingComment}
          />
          <div className="flex justify-between items-center">
            <div className="hidden md:block text-xs text-muted-foreground">
              Presiona Ctrl+Enter para enviar
            </div>
            <Button 
              onClick={handleNewComment} 
              className="transition-all duration-200 ease-in-out hover:shadow-md"
              disabled={submittingComment || !newComment.trim()}
            >
              {submittingComment ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Enviar comentario
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommentForm 