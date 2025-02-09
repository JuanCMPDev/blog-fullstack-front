import React, { useRef, useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, MessageSquare, CornerDownRight, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { useComments } from "@/hooks/useComments"
import { useAuth } from "@/lib/auth"
import type { Comment, CommentsProps } from "@/lib/types"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface CommentItemProps {
  comment: Comment
  depth?: number
  onReply: (id: string) => void
  onLike: (id: string) => void
  onDelete: (id: string) => void
  replyingTo: string | null
  replyContent: string
  onReplyContentChange: (content: string) => void
  onSubmitReply: () => void
  onCancelReply: () => void
}

const CommentItem: React.FC<CommentItemProps> = React.memo(
  ({
    comment,
    depth = 0,
    onReply,
    onLike,
    onDelete,
    replyingTo,
    replyContent,
    onReplyContentChange,
    onSubmitReply,
    onCancelReply,
  }) => {
    const replyInputRef = useRef<HTMLTextAreaElement>(null)
    const { user, isAdmin } = useAuth()
    const { toast } = useToast()

    useEffect(() => {
      if (replyingTo === comment.id && replyInputRef.current) {
        replyInputRef.current.focus()
      }
    }, [replyingTo, comment.id])

    const canDeleteComment = isAdmin() || (user && user.id === comment.author.id)

    const handleLike = () => {
      if (!user) {
        toast({
          title: "Inicio de sesión requerido",
          description: "Debes iniciar sesión para dar like.",
          variant: "destructive",
        })
        return
      }
      onLike(comment.id)
    }

    const handleReply = () => {
      if (!user) {
        toast({
          title: "Inicio de sesión requerido",
          description: "Debes iniciar sesión para responder.",
          variant: "destructive",
        })
        return
      }
      onReply(comment.id)
    }

    return (
      <div className={`mb-6 ${depth > 0 ? "ml-8 pl-4 border-l border-gray-200 dark:border-gray-700" : ""}`}>
        <div className="flex items-start space-x-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
            <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <div className="bg-gradient-to-br from-accent/80 to-secondary/50 p-4 rounded-lg shadow-sm ">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold">{comment.author.name}</p>
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: es })}
                  </p>
                  {canDeleteComment && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(comment.id)}
                      className="text-destructive hover:text-destructive/90"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-sm">{comment.content}</p>
            </div>
            <div className="flex items-center mt-2 space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className="text-muted-foreground hover:text-primary text-xs"
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                {comment.likes}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReply}
                className="text-muted-foreground hover:text-primary text-xs"
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Responder
              </Button>
            </div>
            {replyingTo === comment.id && (
              <div className="mt-4">
                <Textarea
                  ref={replyInputRef}
                  placeholder="Escribe tu respuesta..."
                  className="mb-2 min-h-[80px] resize-none bg-gradient-to-br from-accent/30 to-secondary/20 rounded-lg shadow-sm"
                  value={replyContent}
                  onChange={(e) => onReplyContentChange(e.target.value)}
                />
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={onCancelReply}>
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={onSubmitReply}
                      className="transition-all duration-200 ease-in-out hover:shadow-md"
                    >
                      <CornerDownRight className="w-4 h-4 mr-2" />
                      Responder
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                depth={depth + 1}
                onReply={onReply}
                onLike={onLike}
                onDelete={onDelete}
                replyingTo={replyingTo}
                replyContent={replyContent}
                onReplyContentChange={onReplyContentChange}
                onSubmitReply={onSubmitReply}
                onCancelReply={onCancelReply}
              />
            ))}
          </div>
        )}
      </div>
    )
  },
)

CommentItem.displayName = "CommentItem"

export const Comments: React.FC<CommentsProps> = ({ comments: initialComments }) => {
  const {
    comments,
    replyingTo,
    replyContent,
    handleLike,
    handleReply,
    submitReply,
    setReplyContent,
    addNewComment,
    cancelReply,
    deleteComment,
  } = useComments(initialComments)

  const [newComment, setNewComment] = useState("")
  const { user } = useAuth()
  const { toast } = useToast()

  const handleNewComment = () => {
    if (user) {
      addNewComment(newComment, user.id)
      setNewComment("")
    } else {
      toast({
        title: "Inicio de sesión requerido",
        description: "Debes iniciar sesión para comentar.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Comentarios</h2>
      {user ? (
        <div className="mb-6">
          <div className="flex items-start space-x-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.avatar || "/placeholder.svg?height=40&width=40"} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <Textarea
                placeholder="Escribe un comentario..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-2 min-h-[100px] resize-none bg-gradient-to-br from-accent/40 to-secondary/20  rounded-lg shadow-sm"
              />
              <div className="flex justify-between items-center">
                <Button onClick={handleNewComment} className="transition-all duration-200 ease-in-out hover:shadow-md">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Enviar comentario
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 text-center">
          <p className="text-muted-foreground mb-2">Inicia sesión para dejar un comentario.</p>
          <Button variant="outline" asChild>
            <Link href="/signin">Iniciar sesión</Link>
          </Button>
        </div>
      )}
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onReply={handleReply}
          onLike={handleLike}
          onDelete={deleteComment}
          replyingTo={replyingTo}
          replyContent={replyContent}
          onReplyContentChange={setReplyContent}
          onSubmitReply={submitReply}
          onCancelReply={cancelReply}
        />
      ))}
    </div>
  )
}

Comments.displayName = "Comments"

