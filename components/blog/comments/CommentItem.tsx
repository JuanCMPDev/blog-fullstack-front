"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ensureCommentStructure } from "@/utils/comment-utils";
import { getAvatarUrl } from "@/lib/utils";
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
    isCappedThread = false,
    onReply,
    onLike,
    onDelete,
    onEdit,
    replyingTo,
    replyContent,
    replyFeedback,
    onReplyContentChange,
    onSubmitReply,
    onCancelReply,
    isSubmittingReply,
  }) => {
    const COLLAPSE_FROM_DEPTH = 3;
    const MAX_RENDER_DEPTH = 3;
    const REPLIES_BATCH_SIZE = 5;

    // Estado para controlar si las respuestas están expandidas o contraídas
    const [expanded, setExpanded] = useState(depth < COLLAPSE_FROM_DEPTH);
    const [visibleRepliesCount, setVisibleRepliesCount] = useState(0);

    // Estado para la edición inline
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState("");
    const [isSavingEdit, setIsSavingEdit] = useState(false);

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

    // Determinar si el usuario puede eliminar o editar el comentario
    const canDeleteComment =
      isAdmin() || (user && user.userId === safeComment.author.id);
    const canEditComment = !!(user && user.userId === safeComment.author.id);

    const handleEditStart = () => {
      setEditContent(safeComment.content);
      setIsEditing(true);
    };

    const handleEditCancel = () => {
      setIsEditing(false);
      setEditContent("");
    };

    const handleEditSave = async () => {
      if (!editContent.trim() || editContent.trim() === safeComment.content) {
        setIsEditing(false);
        return;
      }
      setIsSavingEdit(true);
      try {
        await onEdit(safeComment.id, editContent.trim());
        setIsEditing(false);
      } finally {
        setIsSavingEdit(false);
      }
    };

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
    const isAtMaxDepth = depth >= MAX_RENDER_DEPTH;

    useEffect(() => {
      if (!hasReplies) {
        setVisibleRepliesCount(0);
        return;
      }

      if (!expanded) {
        setVisibleRepliesCount(0);
        return;
      }

      if (depth < COLLAPSE_FROM_DEPTH) {
        setVisibleRepliesCount(replies.length);
        return;
      }

      setVisibleRepliesCount((current) => {
        if (current > 0) return Math.min(current, replies.length);
        return Math.min(REPLIES_BATCH_SIZE, replies.length);
      });
    }, [expanded, hasReplies, depth, replies.length]);

    const visibleReplies = replies.slice(0, visibleRepliesCount);
    const hasMoreRepliesToShow = expanded && visibleRepliesCount < replies.length;

    // Función para alternar la expansión de respuestas
    const toggleExpanded = () => {
      setExpanded((prev) => !prev);
    };

    const showMoreReplies = () => {
      setVisibleRepliesCount((current) => Math.min(current + REPLIES_BATCH_SIZE, replies.length));
    };

    // Estilos de indentación basados en la profundidad visual
    const indentationStyles = () => {
      if (isCappedThread) {
        return "pl-0 sm:pl-3";
      }

      // Si estamos más allá de la profundidad visual máxima, ya no aplicamos indentación adicional
      if (isDeepLevel) {
        return "ml-2 sm:ml-8 pl-2 sm:pl-4 border-l-2 border-gray-200 dark:border-gray-700";
      }

      switch (visualDepth) {
        case 0:
          return "";
        case 1:
          return "ml-2 sm:ml-8 border-l-2 border-gray-200 dark:border-gray-700 pl-2 sm:pl-4";
        case 2:
          return "ml-2 sm:ml-8 border-l-2 border-gray-200 dark:border-gray-700 pl-2 sm:pl-4";
        case 3:
        default:
          return "ml-2 sm:ml-8 border-l-2 border-gray-200 dark:border-gray-700 pl-2 sm:pl-4";
      }
    };

    // Personalizar la función de respuesta para respetar el límite de anidación
    const handleReplyRespectingDepth = () => {
      // Comportamiento normal para todos los niveles
      handleReply();
    };

    const avatarUrl = getAvatarUrl(safeComment.author?.avatar);

    return (
      <div className={`mb-3 sm:mb-4 ${indentationStyles()}`}>
        <div className="flex items-start gap-2 sm:gap-4">
          {safeComment.author?.nick ? (
            <Link href={`/profile/${safeComment.author.nick}`} className="flex-shrink-0 mt-1">
              <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                <AvatarImage
                  src={avatarUrl}
                  alt={safeComment.author?.name ?? "Usuario"}
                />
                <AvatarFallback>
                  {safeComment.author?.name?.charAt(0) ?? "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 mt-1">
              <AvatarImage
                src={avatarUrl}
                alt={safeComment.author?.name ?? "Usuario"}
              />
              <AvatarFallback>
                {safeComment.author?.name?.charAt(0) ?? "U"}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="flex-grow min-w-0">
            <div
              className={`bg-card p-3 sm:p-4 rounded-lg shadow-sm ${
                isCappedThread
                  ? "border-l-2 border-gray-200 dark:border-gray-700"
                  : ""
              }`}
            >
              <CommentHeader
                author={safeComment.author}
                createdAt={safeComment.createdAt}
                updatedAt={safeComment.updatedAt}
                canDelete={canDeleteComment}
                canEdit={canEditComment}
                isDeleting={isDeleting}
                onDelete={handleDelete}
                onEditStart={handleEditStart}
              />
              {isEditing ? (
                <div className="mt-1 space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="text-sm resize-none min-h-[80px]"
                    disabled={isSavingEdit}
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEditCancel}
                      disabled={isSavingEdit}
                      className="text-xs"
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleEditSave}
                      disabled={isSavingEdit || !editContent.trim()}
                      className="text-xs"
                    >
                      {isSavingEdit ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : null}
                      Guardar
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm leading-relaxed break-words">
                  {typeof safeComment.content === "string"
                    ? safeComment.content
                    : ""}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <CommentFooter
                likes={safeComment.likes}
                hasLiked={safeComment.hasLiked}
                isLiking={isLiking}
                onLike={handleLike}
                onReply={handleReplyRespectingDepth}
              />

              {/* Botón para contraer/expandir respuestas (solo visible si hay respuestas) */}
              {hasReplies && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-0 sm:ml-auto h-8 px-2 w-full sm:w-auto justify-center"
                  onClick={toggleExpanded}
                  aria-expanded={expanded}
                  aria-controls={`replies-${safeComment.id}`}
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
                    {expanded
                      ? isAtMaxDepth
                        ? "Ocultar subhilo"
                        : depth >= COLLAPSE_FROM_DEPTH
                        ? "Ocultar respuestas"
                        : `${replies.length} ${replies.length === 1 ? "respuesta" : "respuestas"}`
                      : isAtMaxDepth
                      ? `Ver subhilo (${replies.length})`
                      : `Ver respuestas (${replies.length})`}
                  </span>
                </Button>
              )}
            </div>

            {/* Formulario de respuesta */}
            {replyingTo === safeComment.id && (
              <>
                <ReplyForm
                  replyContent={replyContent}
                  replyFeedback={replyFeedback}
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
          <div id={`replies-${safeComment.id}`} className="mt-2 w-full">
            {/* Advertencia visual para niveles muy profundos */}
            {depth >= MAX_VISUAL_DEPTH * 2 && (
              <div className="text-sm text-amber-600 dark:text-amber-400 mb-3 p-2 border border-amber-200 dark:border-amber-800 rounded-md bg-amber-50 dark:bg-amber-900/20">
                Las respuestas están llegando a una profundidad muy alta.
                Considera crear un nuevo hilo para continuar la conversación.
              </div>
            )}

            {visibleReplies.map((reply, index) => (
              <CommentItem
                key={reply.id || `${safeComment.id}-reply-${index}`}
                comment={reply}
                depth={Math.min(depth + 1, MAX_RENDER_DEPTH)}
                isCappedThread={isCappedThread || depth + 1 >= MAX_RENDER_DEPTH}
                onReply={onReply}
                onLike={onLike}
                onDelete={onDelete}
                onEdit={onEdit}
                replyingTo={replyingTo}
                replyContent={replyContent}
                replyFeedback={replyFeedback}
                onReplyContentChange={onReplyContentChange}
                onSubmitReply={onSubmitReply}
                onCancelReply={onCancelReply}
                isSubmittingReply={isSubmittingReply}
              />
            ))}

            {hasMoreRepliesToShow && (
              <div className="mt-3 ml-4 sm:ml-8 pl-3 sm:pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                <Button variant="ghost" size="sm" onClick={showMoreReplies} className="text-xs text-muted-foreground hover:text-primary w-full sm:w-auto justify-start sm:justify-center">
                  Ver más respuestas ({replies.length - visibleRepliesCount} restantes)
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

CommentItem.displayName = "CommentItem";

export default CommentItem;
