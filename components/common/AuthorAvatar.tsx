import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarUrl } from "@/lib/utils"
import type { Author } from "@/lib/types"

interface AuthorAvatarProps {
  author: Author
  className?: string
}

export function AuthorAvatar({ author, className }: AuthorAvatarProps) {
  const avatarUrl = getAvatarUrl(author.avatar)
  
  return (
    <Avatar className={className}>
      <AvatarImage src={avatarUrl} alt={author.name} />
      <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
    </Avatar>
  )
} 