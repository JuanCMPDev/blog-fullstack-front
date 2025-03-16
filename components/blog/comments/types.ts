import type { Comment } from "@/lib/types"

// Definir una interfaz para las respuestas que coincida con lo que devuelve la API
export interface ApiReply {
  id: string;
  content: string;
  parentId?: string;
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt?: string;
  likes?: number;
  postId?: number;
  replies?: ApiReply[];
  [key: string]: unknown;
}

export interface CommentItemProps {
  comment: Comment
  depth?: number
  onReply: (id: string) => void
  onLike: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  replyingTo: string | null
  replyContent: string
  onReplyContentChange: (content: string) => void
  onSubmitReply: () => Promise<void>
  onCancelReply: () => void
  isSubmittingReply: boolean
}

export interface CommentHeaderProps {
  author: Comment['author'];
  createdAt?: string;
  canDelete: boolean | null | undefined;
  isDeleting: boolean;
  onDelete: () => Promise<void>;
}

export interface CommentFooterProps {
  likes?: number;
  isLiking: boolean;
  onLike: () => Promise<void>;
  onReply: () => void;
}

export interface ReplyFormProps {
  replyContent: string;
  onReplyContentChange: (content: string) => void;
  onSubmitReply: () => Promise<void>;
  onCancelReply: () => void;
  isSubmittingReply: boolean;
  replyInputRef: React.RefObject<HTMLTextAreaElement | null>;
} 