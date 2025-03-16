"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import CommentItem from "./comments/CommentItem"
import type { Comment } from "@/lib/types"
import { ensureCommentStructure } from "@/utils/comment-utils"

interface CommentListProps {
  comments: Comment[]
  isLoading: boolean
  replyingTo: string | null
  replyContent: string
  onReplyContentChange: (content: string) => void
  onReply: (id: string) => void
  onLike: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onSubmitReply: () => Promise<void>
  onCancelReply: () => void
}

const CommentList: React.FC<CommentListProps> = ({
  comments,
  isLoading,
  replyingTo,
  replyContent,
  onReplyContentChange,
  onReply,
  onLike,
  onDelete,
  onSubmitReply,
  onCancelReply,
}) => {
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [processedComments, setProcessedComments] = useState<Comment[]>([])

  // Procesar los comentarios cuando cambian
  useEffect(() => {
    // Asegurar que todos los comentarios tengan la estructura correcta
    const safeComments = Array.isArray(comments) ? comments.map(ensureCommentStructure) : []

    // Depuración para verificar cómo están llegando los comentarios y sus respuestas
    console.log("[DEBUG] CommentList recibió comments:", comments)

    // Contar cuántas respuestas hay en total en la estructura anidada
    const countReplies = (cmts: Comment[]): number => {
      if (!Array.isArray(cmts)) return 0

      return cmts.reduce((total, comment) => {
        const directReplies = Array.isArray(comment.replies) ? comment.replies.length : 0
        const nestedReplies = countReplies(comment.replies)
        return total + directReplies + nestedReplies
      }, 0)
    }

    const totalReplies = countReplies(safeComments)
    console.log(
      `[DEBUG] CommentList: ${safeComments.length} comentarios principales con ${totalReplies} respuestas anidadas`,
    )

    setProcessedComments(safeComments)
  }, [comments])

  const handleSubmitReply = async () => {
    setIsSubmittingReply(true)
    try {
      await onSubmitReply()
    } finally {
      setIsSubmittingReply(false)
    }
  }

  if (isLoading && processedComments.length === 0) {
    return (
      <div className="flex justify-center my-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (processedComments.length === 0 && !isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No hay comentarios aún. ¡Sé el primero en comentar!</p>
      </div>
    )
  }

  return (
    <div className="comments-container">
      {processedComments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onReply={onReply}
          onLike={onLike}
          onDelete={onDelete}
          replyingTo={replyingTo}
          replyContent={replyContent}
          onReplyContentChange={onReplyContentChange}
          onSubmitReply={handleSubmitReply}
          onCancelReply={onCancelReply}
          isSubmittingReply={isSubmittingReply}
        />
      ))}
    </div>
  )
}

export default CommentList

