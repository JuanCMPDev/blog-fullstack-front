import React from "react"
import { Loader2, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { CommentHeaderProps } from "./types"

// Componente para la cabecera del comentario
const CommentHeader: React.FC<CommentHeaderProps> = ({ 
  author, 
  createdAt, 
  canDelete, 
  isDeleting, 
  onDelete 
}) => {
  return (
    <div className="flex items-center justify-between mb-2">
      <p className="font-semibold">
        {author && typeof author === 'object' && typeof author.name === 'string'
          ? author.name
          : 'Usuario'}
      </p>
      <div className="flex items-center space-x-2">
        <p className="text-xs text-muted-foreground">
          {(() => {
            try {
              return formatDistanceToNow(new Date(createdAt || Date.now()), { addSuffix: true, locale: es });
            } catch (e) {
              console.error('Error al formatear fecha:', e);
              return 'hace un momento';
            }
          })()}
        </p>
        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-destructive hover:text-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default CommentHeader; 