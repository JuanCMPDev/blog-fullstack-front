import React, { useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, MessageSquare, CornerDownRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { useComments } from "@/hooks/useComments"

interface Comment {
  id: string
  author: {
    name: string
    avatar: string
  }
  content: string
  likes: number
  replies: Comment[]
  createdAt: string
}

interface CommentsProps {
  comments: Comment[]
}

const CommentItem: React.FC<{
  comment: Comment
  depth?: number
  onReply: (id: string) => void
  onLike: (id: string) => void
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
    replyingTo,
    replyContent,
    onReplyContentChange,
    onSubmitReply,
    onCancelReply,
  }) => {
    const replyInputRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
      if (replyingTo === comment.id && replyInputRef.current) {
        replyInputRef.current.focus()
      }
    }, [replyingTo, comment.id])

    return (
      <div className={`mb-4 ${depth > 0 ? "ml-4 pl-4 border-l border-gray-200 dark:border-gray-700" : ""}`}>
        <div className="flex items-start space-x-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
            <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <div className="bg-secondary p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold">{comment.author.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: es })}
                </p>
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
              <div className="mt-2">
                <Textarea
                  ref={replyInputRef}
                  placeholder="Escribe tu respuesta..."
                  className="mb-2"
                  value={replyContent}
                  onChange={(e) => onReplyContentChange(e.target.value)}
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={onCancelReply}>
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={onSubmitReply}>
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
  } = useComments(initialComments)

  const [newComment, setNewComment] = React.useState("")

  const handleNewComment = () => {
    addNewComment(newComment)
    setNewComment("")
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Comentarios</h2>
      <div className="mb-4">
        <Textarea
          placeholder="Escribe un comentario..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="mb-2"
        />
        <Button onClick={handleNewComment}>
          <MessageSquare className="w-4 h-4 mr-2" />
          Enviar comentario
        </Button>
      </div>
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onReply={handleReply}
          onLike={handleLike}
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

