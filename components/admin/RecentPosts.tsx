import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarUrl } from "@/lib/utils"

const recentPosts = [
  {
    id: 1,
    title: "Introducción a Next.js 13",
    author: "María García",
    date: "10 Jun 2023",
    avatar: "/avatars/maria.png",
  },
  {
    id: 2,
    title: "Mejores prácticas de React en 2023",
    author: "Carlos Rodríguez",
    date: "5 Jun 2023",
    avatar: "/avatars/carlos.png",
  },
  {
    id: 3,
    title: "Cómo optimizar el rendimiento de tu sitio web",
    author: "Ana Martínez",
    date: "1 Jun 2023",
    avatar: "/avatars/ana.png",
  },
]

export function RecentPosts() {
  return (
    <div className="space-y-8">
      {recentPosts.map((post) => (
        <div key={post.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={getAvatarUrl(post.avatar)} alt={`Avatar de ${post.author}`} />
            <AvatarFallback>
              {post.author
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{post.title}</p>
            <p className="text-sm text-muted-foreground">por {post.author}</p>
          </div>
          <div className="ml-auto font-medium">{post.date}</div>
        </div>
      ))}
    </div>
  )
}

