import React from "react"
import { Loader2, CornerDownRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ReplyFormProps } from "./types"

// Componente para el formulario de respuesta
const ReplyForm: React.FC<ReplyFormProps> = ({ 
  replyContent, 
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
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={onCancelReply} disabled={isSubmittingReply}>
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={onSubmitReply}
            className="transition-all duration-200 ease-in-out hover:shadow-md"
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