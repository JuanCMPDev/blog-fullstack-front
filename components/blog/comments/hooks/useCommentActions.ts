import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

// Hook para manejar acciones del comentario (like, delete, reply)
export function useCommentActions(
  commentId: string, 
  onLike: (id: string) => Promise<void>, 
  onDelete: (id: string) => Promise<void>, 
  onReply: (id: string) => void
) {
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Inicio de sesión requerido",
        description: "Debes iniciar sesión para dar like.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLiking(true);
    try {
      await onLike(commentId);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(commentId);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReply = () => {
    if (!user) {
      toast({
        title: "Inicio de sesión requerido",
        description: "Debes iniciar sesión para responder.",
        variant: "destructive",
      });
      return;
    }
    onReply(commentId);
  };

  return {
    isLiking,
    isDeleting,
    handleLike,
    handleDelete,
    handleReply
  };
} 