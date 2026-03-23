import React from "react"
import { Loader2, CornerDownRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ReplyFormProps } from "./types"

// Componente para el formulario de respuesta
const ReplyForm: React.FC<ReplyFormProps> = ({ 
  replyContent, 
  replyFeedback,
  onReplyContentChange, 
  onSubmitReply, 
  onCancelReply, 
  isSubmittingReply, 
  replyInputRef 
}) => {
  return (
    <div className="mt-4">
      <Textarea
        ref={replyInputRef}
        placeholder="Escribe tu respuesta..."
        className="mb-2 min-h-[80px] resize-none bg-accent/10 rounded-lg shadow-sm"
        value={replyContent}
        onChange={(e) => onReplyContentChange(e.target.value)}
        disabled={isSubmittingReply}
      />
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <p className="text-xs text-muted-foreground order-2 sm:order-1" aria-live="polite">{replyFeedback ?? ""}</p>
        <div className="flex flex-col sm:flex-row gap-2 order-1 sm:order-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={onCancelReply} disabled={isSubmittingReply}>
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={onSubmitReply}
            className="transition-all duration-200 ease-in-out hover:shadow-md w-full sm:w-auto"
            disabled={isSubmittingReply}
          >
            {isSubmittingReply ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CornerDownRight className="w-4 h-4 mr-2" />
            )}
            Responder
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReplyForm; 