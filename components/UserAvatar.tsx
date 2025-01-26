import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserAvatarProps } from "@/lib/types"

export function UserAvatar({ name, image }: UserAvatarProps) {
  return (
    <Avatar>
      <AvatarImage src={image} alt={name} />
      <AvatarFallback>{name.charAt(0)}</AvatarFallback>
    </Avatar>
  )
}

