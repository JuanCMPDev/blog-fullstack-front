import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarUrl } from "@/lib/utils"
import type { Author } from "@/lib/types"

interface AuthorAvatarProps {
  author?: Author | null
  className?: string
}

export function AuthorAvatar({ author, className }: AuthorAvatarProps) {
  // Si no hay autor, usar valores predeterminados
  const name = author?.name || 'Usuario';
  const avatarUrl = author ? getAvatarUrl(author.avatar) : '/placeholder-user.jpg';
  const initial = name.charAt(0).toUpperCase();
  
  return (
    <Avatar className={className}>
      <AvatarImage src={avatarUrl} alt={name} />
      <AvatarFallback>{initial}</AvatarFallback>
    </Avatar>
  )
} 