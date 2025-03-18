"use client";

import React, { useRef, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ensureCommentStructure } from "@/utils/comment-utils";
import type { CommentItemProps } from "./types";
import { useCommentReplies } from "./hooks/useCommentReplies";
import { useCommentActions } from "./hooks/useCommentActions";
import CommentHeader from "./CommentHeader";
import CommentFooter from "./CommentFooter";
import ReplyForm from "./ReplyForm";

// Componente principal CommentItem
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
    isSubmittingReply,
  }) => {
    // Estado para controlar si las respuestas están expandidas o contraídas
    const [expanded, setExpanded] = useState(true);

    // Asegurar que el comentario tenga la estructura correcta
    const safeComment = ensureCommentStructure(comment);
    const replyInputRef = useRef<HTMLTextAreaElement>(null);
    const { user, isAdmin } = useAuth();

    // Hooks personalizados para manejar la lógica
    const { combinedReplies } = useCommentReplies(
      safeComment.id,
      Array.isArray(safeComment.replies) ? safeComment.replies : []
    );

    const { isLiking, isDeleting, handleLike, handleDelete, handleReply } =
      useCommentActions(safeComment.id, onLike, onDelete, onReply);

    // Determinar si el usuario puede eliminar el comentario
    const canDeleteComment =
      isAdmin() || (user && user.userId === safeComment.author.id);

    // Efecto para el enfoque del textarea de respuesta
    useEffect(() => {
      if (replyingTo === safeComment.id && replyInputRef.current) {
        replyInputRef.current.focus();
      }
    }, [replyingTo, safeComment.id]);

    // Limitar la profundidad máxima de anidación visual a 3
    const MAX_VISUAL_DEPTH = 3;

    // Calcular la profundidad visual
    const visualDepth = Math.min(depth, MAX_VISUAL_DEPTH);

    // Determinar si estamos en un nivel profundo (más allá de la profundidad visual máxima)
    const isDeepLevel = depth > MAX_VISUAL_DEPTH;

    // Obtener las respuestas
    const replies = combinedReplies();
    const hasReplies = Array.isArray(replies) && replies.length > 0;

    // Función para alternar la expansión de respuestas
    const toggleExpanded = () => {
      setExpanded(!expanded);
    };

    // Estilos de indentación basados en la profundidad visual
    const indentationStyles = () => {
      // Si estamos más allá de la profundidad visual máxima, ya no aplicamos indentación adicional
      if (isDeepLevel) {
        return "ml-8 pl-4 border-l-2 border-gray-200 dark:border-gray-700";
      }

      switch (visualDepth) {
        case 0:
          return "";
        case 1:
          return "ml-8 border-l-2 border-gray-200 dark:border-gray-700 pl-4";
        case 2:
          return "ml-8 border-l-2 border-gray-200 dark:border-gray-700 pl-4";
        case 3:
        default:
          return "ml-8 border-l-2 border-gray-200 dark:border-gray-700 pl-4";
      }
    };

    // Personalizar la función de respuesta para respetar el límite de anidación
    const handleReplyRespectingDepth = () => {
      // Comportamiento normal para todos los niveles
      handleReply();
    };

    const avatarUrl = `https://${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${safeComment.author.avatar}`;
    
    console.log(avatarUrl);

    return (
      <div className={`mb-4 ${indentationStyles()}`}>
        <div className="flex items-start space-x-4">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage
              src={safeComment.author?.avatar ? avatarUrl : "/default-avatar.png"}
              alt={safeComment.author?.name ?? "Usuario"}
            />
            <AvatarFallback>
              {safeComment.author?.name?.charAt(0) ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-grow min-w-0">
            <div className="bg-card p-4 rounded-lg shadow-sm">
              <CommentHeader
                author={safeComment.author}
                createdAt={safeComment.createdAt}
                canDelete={canDeleteComment}
                isDeleting={isDeleting}
                onDelete={handleDelete}
              />
              <p className="text-sm break-words">
                {typeof safeComment.content === "string"
                  ? safeComment.content
                  : ""}
              </p>
            </div>

            <div className="flex items-center mt-2">
              <CommentFooter
                likes={safeComment.likes}
                isLiking={isLiking}
                onLike={handleLike}
                onReply={handleReplyRespectingDepth}
              />

              {/* Botón para contraer/expandir respuestas (solo visible si hay respuestas) */}
              {hasReplies && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto h-8 px-2"
                  onClick={toggleExpanded}
                  aria-label={
                    expanded ? "Contraer respuestas" : "Expandir respuestas"
                  }
                >
                  {expanded ? (
                    <ChevronUp size={16} className="mr-1" />
                  ) : (
                    <ChevronDown size={16} className="mr-1" />
                  )}
                  <span className="text-xs">
                    {replies.length}{" "}
                    {replies.length === 1 ? "respuesta" : "respuestas"}
                  </span>
                </Button>
              )}
            </div>

            {/* Formulario de respuesta */}
            {replyingTo === safeComment.id && (
              <>
                <ReplyForm
                  replyContent={replyContent}
                  onReplyContentChange={onReplyContentChange}
                  onSubmitReply={onSubmitReply}
                  onCancelReply={onCancelReply}
                  isSubmittingReply={isSubmittingReply}
                  replyInputRef={replyInputRef}
                />
              </>
            )}
          </div>
        </div>

        {/* Renderizar las respuestas si están expandidas */}
        {hasReplies && expanded && (
          <div className="mt-2 w-full">
            {/* Advertencia visual para niveles muy profundos */}
            {depth >= MAX_VISUAL_DEPTH * 2 && (
              <div className="text-sm text-amber-600 dark:text-amber-400 mb-3 p-2 border border-amber-200 dark:border-amber-800 rounded-md bg-amber-50 dark:bg-amber-900/20">
                Las respuestas están llegando a una profundidad muy alta.
                Considera crear un nuevo hilo para continuar la conversación.
              </div>
            )}

            {/* Renderizamos los comentarios en el nivel que corresponde */}
            {replies.map((reply, index) => (
              <CommentItem
                key={reply.id || `${safeComment.id}-reply-${index}`}
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
                isSubmittingReply={isSubmittingReply}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);

CommentItem.displayName = "CommentItem";

export default CommentItem;
