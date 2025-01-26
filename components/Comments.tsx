import React, { useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, MessageSquare, CornerDownRight, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { useComments } from "@/hooks/useComments"
import { useAuth } from "@/lib/auth"
import type { Comment, CommentsProps } from "@/lib/types"

const CommentItem: React.FC<{
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
}> = React.memo(
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

    const canDeleteComment = isAdmin() || (user && user.id === comment.author.id)

    useEffect(() => {
      if (replyingTo === comment.id && replyInputRef.current) {
        replyInputRef.current.focus()
      }
    }, [replyingTo, comment.id])

    return (
      <div className={`mb-6 ${depth > 0 ? "ml-8 pl-4 border-l border-gray-200 dark:border-gray-700" : ""}`}>
        <div className="flex items-start space-x-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
            <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <div className="bg-secondary p-4 rounded-lg shadow-sm">
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
                onClick={() => onLike(comment.id)}
                className="text-muted-foreground hover:text-primary text-xs"
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                {comment.likes}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReply(comment.id)}
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
                  className="mb-2 min-h-[80px] resize-none"
                  value={replyContent}
                  onChange={(e) => onReplyContentChange(e.target.value)}
                />
                <div className="flex justify-end space-x-2">
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

  const [newComment, setNewComment] = React.useState("")
  const { user } = useAuth()

  const handleNewComment = () => {
    if (user) {
      addNewComment(newComment, user.id)
      setNewComment("")
    } else {
      // Manejar el caso de usuario no autenticado
      alert("Debes iniciar sesión para comentar")
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
                className="mb-2 min-h-[100px] resize-none"
              />
              <div className="flex justify-end">
                <Button onClick={handleNewComment} className="transition-all duration-200 ease-in-out hover:shadow-md">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Enviar comentario
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="mb-6 text-center text-muted-foreground">Inicia sesión para dejar un comentario.</p>
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

