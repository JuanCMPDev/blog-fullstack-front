import React from "react"
import { Loader2, ThumbsUp, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CommentFooterProps } from "./types"

// Componente para el pie del comentario
const CommentFooter: React.FC<CommentFooterProps> = ({ 
  likes = 0, 
  isLiking, 
  onLike, 
  onReply 
}) => {
  return (
    <div className="flex items-center mt-2 space-x-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onLike}
        className="text-muted-foreground hover:text-primary text-xs"
        disabled={isLiking}
      >
        {isLiking ? (
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
        ) : (
          <ThumbsUp className="w-4 h-4 mr-1" />
        )}
        {typeof likes === 'number' ? likes : 0}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onReply}
        className="text-muted-foreground hover:text-primary text-xs"
      >
        <MessageSquare className="w-4 h-4 mr-1" />
        Responder
      </Button>
    </div>
  );
};

export default CommentFooter; 