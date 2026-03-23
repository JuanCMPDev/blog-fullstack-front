export type LikeHttpMethod = 'PUT' | 'DELETE'

export function buildUserStatusEndpoint(userId: string): string {
  return `users/${userId}/status`
}

export function buildUserStatusPayload(isBanned: boolean): { isBanned: boolean } {
  return { isBanned }
}

export function buildPostLikeEndpoint(postId: number): string {
  return `posts/${postId}/like`
}

export function buildCommentLikeEndpoint(commentId: string): string {
  return `comments/${commentId}/like`
}

export function getLikeHttpMethod(hasLiked: boolean): LikeHttpMethod {
  return hasLiked ? 'DELETE' : 'PUT'
}

export function buildPostCommentsEndpoint(
  postId: number,
  options: { page: number; limit: number; order: string }
): string {
  const params = new URLSearchParams({
    page: String(options.page),
    limit: String(options.limit),
    order: options.order,
  })

  return `posts/${postId}/comments/nested?${params.toString()}`
}
