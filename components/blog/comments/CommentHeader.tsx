import React from "react"
import Link from "next/link"
import { Loader2, Trash2, Pencil } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CommentHeaderProps } from "./types"

// Componente para la cabecera del comentario
const CommentHeader: React.FC<CommentHeaderProps> = ({
  author,
  createdAt,
  updatedAt,
  canDelete,
  canEdit,
  isDeleting,
  onDelete,
  onEditStart,
}) => {
  const wasEdited =
    updatedAt &&
    createdAt &&
    Math.abs(new Date(updatedAt).getTime() - new Date(createdAt).getTime()) > 5000;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-2">
      {author && typeof author === 'object' && typeof author.name === 'string' && author.nick ? (
        <Link
          href={`/profile/${author.nick}`}
          className="font-semibold text-sm sm:text-base break-words hover:text-primary transition-colors"
        >
          {author.name}
        </Link>
      ) : (
        <p className="font-semibold text-sm sm:text-base break-words">
          {author && typeof author === 'object' && typeof author.name === 'string'
            ? author.name
            : 'Usuario'}
        </p>
      )}
      <div className="flex items-center justify-between sm:justify-end gap-1 w-full sm:w-auto">
        <div className="flex items-center gap-1.5">
          <p className="text-xs text-muted-foreground truncate">
            {(() => {
              try {
                return formatDistanceToNow(new Date(createdAt || Date.now()), { addSuffix: true, locale: es });
              } catch (e) {
                console.error('Error al formatear fecha:', e);
                return 'hace un momento';
              }
            })()}
          </p>
          {wasEdited && (
            <span className="text-xs text-muted-foreground/70 italic">(editado)</span>
          )}
        </div>
        {canEdit && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground px-2"
            onClick={onEditStart}
            aria-label="Editar comentario"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
        {canDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive/90 px-2"
                disabled={isDeleting}
                aria-label="Eliminar comentario"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar comentario?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. El comentario y sus respuestas desaparecerán de este hilo.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    void onDelete()
                  }}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Eliminando..." : "Eliminar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
};


export default CommentHeader; 