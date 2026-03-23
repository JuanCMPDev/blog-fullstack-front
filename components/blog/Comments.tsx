import React, { useEffect, memo } from "react"
import { Loader2 } from "lucide-react"
import { useComments } from "@/hooks/useComments"
import type { CommentsProps } from "@/lib/types"
import { ensureCommentStructure } from "@/utils/comment-utils"
import { createLogger } from "@/lib/logger"
import CommentForm from "./CommentForm"
import CommentList from "./CommentList"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const logger = createLogger("Comments")

export const Comments: React.FC<CommentsProps> = memo(({ comments: initialComments, postId }) => {
  // Usar el postId recibido directamente como prop, o como respaldo extraerlo de los comentarios
  const getPostId = (): number | null => {
    // Si tenemos un postId como prop, usarlo primero
    if (postId !== undefined) return postId;
    
    // Como respaldo, intentar extraerlo de los comentarios
    if (initialComments.length === 0) return null;
    return initialComments[0].postId || null;
  };
  
  // Asegurar que todos los comentarios tengan la estructura correcta
  const safeInitialComments = initialComments.map(ensureCommentStructure);
  
  const {
    comments,
    isFetchingList,
    isSubmittingComment,
    isSubmittingReply,
    isLoadingMore,
    commentsError,
    liveMessage,
    commentFeedback,
    replyFeedback,
    replyingTo,
    replyContent,
    handleLike,
    handleReply,
    submitReply,
    setReplyContent,
    addNewComment,
    cancelReply,
    deleteComment,
    editComment,
    loadMoreComments,
    retryComments,
    changeCommentsOrder,
    hasMore,
    meta,
    order,
  } = useComments({ 
    postId: getPostId(), 
    initialComments: safeInitialComments 
  })

  // Verificar que comments sea siempre un array para depuración
  useEffect(() => {
    if (!Array.isArray(comments)) {
      logger.error('Error: comments no es un array', comments)
    }
  }, [comments]);

  // Asegurar que tenemos un array seguro para trabajar
  const safeComments = Array.isArray(comments) ? comments : [];

  return (
    <section className="mt-8" aria-busy={isFetchingList || isSubmittingComment || isSubmittingReply || isLoadingMore}>
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Comentarios</h2>
      <p className="sr-only" aria-live="polite">{liveMessage}</p>
      
      {/* Selector de orden */}
      {meta && meta.totalItems > 0 && (
        <div className="flex justify-stretch sm:justify-end mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto" role="group" aria-label="Orden de comentarios">
            <span id="comments-order-label" className="text-sm text-muted-foreground">
              Ordenar por:
            </span>
            <Select
              value={order}
              onValueChange={changeCommentsOrder}
              disabled={isFetchingList || isLoadingMore}
            >
              <SelectTrigger className="w-full sm:w-[210px]" aria-labelledby="comments-order-label">
                <SelectValue placeholder="Selecciona el orden" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="likes_desc">Más likes primero</SelectItem>
                <SelectItem value="newest">Más recientes primero</SelectItem>
                <SelectItem value="oldest">Más antiguos primero</SelectItem>
                <SelectItem value="likes_asc">Menos likes primero</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {commentsError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>No se pudieron cargar los comentarios</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-sm">{commentsError}</span>
            <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={retryComments} disabled={isFetchingList || isLoadingMore}>
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* El formulario de comentarios siempre está visible */}
      <CommentForm 
        onSubmitComment={addNewComment}
        isSubmitting={isSubmittingComment}
        feedbackMessage={commentFeedback}
      />

      <CommentList 
        comments={safeComments}
        isListLoading={isFetchingList}
        isSubmittingReply={isSubmittingReply}
        replyingTo={replyingTo}
        replyContent={replyContent}
        replyFeedback={replyFeedback}
        onReplyContentChange={setReplyContent}
        onReply={handleReply}
        onLike={handleLike}
        onDelete={deleteComment}
        onEdit={editComment}
        onSubmitReply={submitReply}
        onCancelReply={cancelReply}
      />
      
      {/* Mostrar el loader de carga incremental */}
      {isLoadingMore && safeComments.length > 0 && (
        <div className="flex justify-center my-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      
      {/* Botón para cargar más comentarios */}
      {hasMore && !isLoadingMore && !isFetchingList && safeComments.length > 0 && (
        <div className="flex justify-center mt-6">
          <Button 
            variant="outline"
            className="w-full sm:w-auto"
            onClick={loadMoreComments}
            disabled={isLoadingMore}
          >
            Ver más comentarios
          </Button>
        </div>
      )}
    </section>
  )
})

Comments.displayName = "Comments"


