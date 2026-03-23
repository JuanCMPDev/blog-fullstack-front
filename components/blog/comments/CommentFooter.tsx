import React from "react"
import { Loader2, ThumbsUp, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CommentFooterProps } from "./types"

// Componente para el pie del comentario
const CommentFooter: React.FC<CommentFooterProps> = ({ 
  likes = 0, 
  hasLiked = false,
  isLiking, 
  onLike, 
  onReply 
}) => {
  return (
    <div className="flex flex-wrap items-center mt-2 gap-2 sm:gap-4 w-full sm:w-auto">
      <Button
        variant={hasLiked ? "default" : "ghost"}
        size="sm"
        onClick={onLike}
        className={hasLiked ? "text-xs min-w-[88px]" : "text-muted-foreground hover:text-primary text-xs min-w-[88px]"}
        disabled={isLiking}
        aria-pressed={hasLiked}
      >
        {isLiking ? (
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
        ) : (
          <ThumbsUp className={`w-4 h-4 mr-1 ${hasLiked ? "fill-current" : ""}`} />
        )}
        {typeof likes === 'number' ? likes : 0}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onReply}
        className="text-muted-foreground hover:text-primary text-xs min-w-[108px]"
      >
        <MessageSquare className="w-4 h-4 mr-1" />
        Responder
      </Button>
    </div>
  );
};

export default CommentFooter; 