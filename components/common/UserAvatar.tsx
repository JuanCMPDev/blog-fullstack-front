import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserAvatarProps } from "@/lib/types"

export function UserAvatar({ name, avatar }: UserAvatarProps) {
  return (
    <Avatar>
      <AvatarImage src={avatar} alt={name} />
      <AvatarFallback>{name.charAt(0)}</AvatarFallback>
    </Avatar>
  )
}

