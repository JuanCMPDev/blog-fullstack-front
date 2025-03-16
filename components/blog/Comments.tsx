import React, { useEffect, memo } from "react"
import { Loader2 } from "lucide-react"
import { useComments } from "@/hooks/useComments"
import type { CommentsProps } from "@/lib/types"
import { ensureCommentStructure } from "@/utils/comment-utils"
import CommentForm from "./CommentForm"
import CommentList from "./CommentList"
import { Button } from "@/components/ui/button"

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
  
  // Reducir logs de depuración en producción
  if (process.env.NODE_ENV === 'development') {
    console.log('[DEBUG] Comments - Renderizando componente con postId:', postId);
  }
  
  const {
    comments,
    isLoading,
    replyingTo,
    replyContent,
    handleLike,
    handleReply,
    submitReply,
    setReplyContent,
    addNewComment,
    cancelReply,
    deleteComment,
    loadMoreComments,
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
    if (!Array.isArray(comments) && process.env.NODE_ENV === 'development') {
      console.error('Error: comments no es un array', comments);
    }
  }, [comments]);

  // Asegurar que tenemos un array seguro para trabajar
  const safeComments = Array.isArray(comments) ? comments : [];

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Comentarios</h2>
      
      {/* Selector de orden */}
      {meta && meta.totalItems > 0 && (
        <div className="flex justify-end mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Ordenar por:
            </span>
            <select 
              className="text-sm border rounded p-1"
              value={order}
              onChange={(e) => {
                console.log(`[DEBUG] Selector de orden: Usuario seleccionó ${e.target.value}`);
                changeCommentsOrder(e.target.value);
              }}
              disabled={isLoading}
            >
              <option value="likes_desc">Más likes primero</option>
              <option value="newest">Más recientes primero</option>
              <option value="oldest">Más antiguos primero</option>
              <option value="likes_asc">Menos likes primero</option>
            </select>
          </div>
        </div>
      )}
      
      {/* El formulario de comentarios siempre está visible */}
      <CommentForm 
        onSubmitComment={addNewComment}
        isLoading={isLoading}
      />
      
      {/* Sección de comentarios con loader condicional */}
      {isLoading && safeComments.length === 0 ? (
        <div className="flex justify-center my-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <CommentList 
          comments={safeComments}
          isLoading={isLoading}
          replyingTo={replyingTo}
          replyContent={replyContent}
          onReplyContentChange={setReplyContent}
          onReply={handleReply}
          onLike={handleLike}
          onDelete={deleteComment}
          onSubmitReply={submitReply}
          onCancelReply={cancelReply}
        />
      )}
      
      {/* Mostrar el loader de carga en proceso */}
      {isLoading && safeComments.length > 0 && (
        <div className="flex justify-center my-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      
      {/* Botón para cargar más comentarios */}
      {hasMore && !isLoading && safeComments.length > 0 && (
        <div className="flex justify-center mt-6">
          <Button 
            variant="outline"
            onClick={loadMoreComments}
          >
            Ver más comentarios
          </Button>
        </div>
      )}
    </div>
  )
})

Comments.displayName = "Comments"


