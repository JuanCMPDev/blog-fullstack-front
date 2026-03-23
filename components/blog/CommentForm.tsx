import React, { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { getAvatarUrl } from "@/lib/utils"
import { MessageSquare, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface CommentFormProps {
  onSubmitComment: (content: string) => Promise<boolean | undefined>
  isSubmitting?: boolean
  feedbackMessage?: string | null
}

const CommentForm: React.FC<CommentFormProps> = ({ onSubmitComment, isSubmitting = false, feedbackMessage }) => {
  const [newComment, setNewComment] = useState("")
  const { user } = useAuth()
  const { toast } = useToast()

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
    if (isSubmitting) return // No permitir múltiples envíos

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
    }
  }

  // Manejar tecla Enter para enviar comentario
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey && !isSubmitting && newComment.trim()) {
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
      <div className="flex items-start gap-2 sm:gap-4">
        <Avatar className="w-8 h-8 sm:w-10 sm:h-10 mt-1">
          <AvatarImage src={getAvatarUrl(user.avatar)} alt={typeof user.name === 'string' ? user.name : 'Usuario'} />
          <AvatarFallback>{typeof user.name === 'string' && user.name.length > 0 ? user.name.charAt(0) : 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <Textarea
            placeholder="Escribe un comentario..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            className="mb-2 min-h-[100px] resize-none bg-gradient-to-br from-accent/40 to-secondary/20 rounded-lg shadow-sm"
            disabled={isSubmitting}
          />
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div className="text-xs text-muted-foreground order-2 sm:order-1" aria-live="polite">
              {feedbackMessage ?? "Presiona Ctrl+Enter para enviar"}
            </div>
            <Button 
              onClick={handleNewComment} 
              className="transition-all duration-200 ease-in-out hover:shadow-md w-full sm:w-auto order-1 sm:order-2"
              disabled={isSubmitting || !newComment.trim()}
            >
              {isSubmitting ? (
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