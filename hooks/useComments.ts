import { useState, useCallback } from "react"

interface Comment {
  id: string
  author: {
    name: string
    avatar: string
  }
  content: string
  likes: number
  replies: Comment[]
  createdAt: string
}

export const useComments = (initialComments: Comment[]) => {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")

  const handleLike = useCallback((commentId: string) => {
    const updateLikes = (comment: Comment): Comment => {
      if (comment.id === commentId) {
        return { ...comment, likes: comment.likes + 1 }
      }
      return {
        ...comment,
        replies: comment.replies.map(updateLikes),
      }
    }
    setComments((prevComments) => prevComments.map(updateLikes))
  }, [])

  const handleReply = useCallback((commentId: string) => {
    setReplyingTo(commentId)
    setReplyContent("")
  }, [])

  const submitReply = useCallback(() => {
    if (replyingTo && replyContent.trim()) {
      const newReply: Comment = {
        id: Date.now().toString(),
        author: { name: "Usuario Actual", avatar: "/placeholder.svg?height=40&width=40" },
        content: replyContent.trim(),
        likes: 0,
        replies: [],
        createdAt: new Date().toISOString(),
      }

      const addReply = (comment: Comment): Comment => {
        if (comment.id === replyingTo) {
          return { ...comment, replies: [...comment.replies, newReply] }
        }
        return {
          ...comment,
          replies: comment.replies.map(addReply),
        }
      }

      setComments((prevComments) => prevComments.map(addReply))
      setReplyingTo(null)
      setReplyContent("")
    }
  }, [replyingTo, replyContent])

  const addNewComment = useCallback((newCommentContent: string) => {
    if (newCommentContent.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        author: { name: "Usuario Actual", avatar: "/placeholder.svg?height=40&width=40" },
        content: newCommentContent.trim(),
        likes: 0,
        replies: [],
        createdAt: new Date().toISOString(),
      }
      setComments((prevComments) => [comment, ...prevComments])
    }
  }, [])

  return {
    comments,
    replyingTo,
    replyContent,
    handleLike,
    handleReply,
    submitReply,
    setReplyContent,
    addNewComment,
    cancelReply: () => setReplyingTo(null),
  }
}

