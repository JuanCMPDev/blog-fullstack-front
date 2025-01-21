import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { Calendar, TrendingUp } from "lucide-react"

interface Post {
  id: number
  title: string
  excerpt: string
  tags: string[]
  image: string
}

interface SidebarProps {
  recommendedPosts?: Post[]
}

const defaultRecommendedPosts: Post[] = [
  {
    id: 1,
    title: "Introducción a React Hooks",
    excerpt: "Aprende a usar los Hooks más comunes en React",
    tags: ["React", "JavaScript"],
    image: "/placeholder-post-image.jpeg",
  },
  {
    id: 2,
    title: "Optimización de rendimiento en React",
    excerpt: "Técnicas para mejorar el rendimiento de tus aplicaciones React",
    tags: ["React", "Performance"],
    image: "/placeholder-post-image.jpeg",
  },
  {
    id: 3,
    title: "Introducción a Next.js",
    excerpt: "Descubre las ventajas de usar Next.js para tus proyectos React",
    tags: ["Next.js", "React"],
    image: "/placeholder-post-image.jpeg",
  },
]

export function Sidebar({ recommendedPosts = defaultRecommendedPosts }: SidebarProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <TrendingUp className="mr-2 h-5 w-5" />
            Posts Recomendados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {recommendedPosts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/post/${post.id}`}
                  className="flex items-start space-x-4 hover:bg-accent p-2 rounded-md transition-colors"
                >
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                      src={post.image || "/placeholder.svg"}
                      alt={post.title}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-md"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold line-clamp-2 text-sm">{post.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {post.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Calendar className="mr-2 h-5 w-5" />
            Próximos Eventos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li>
              <h4 className="font-semibold text-sm">Webinar: Introducción a React</h4>
              <p className="text-xs text-muted-foreground">15 de Julio, 2023</p>
            </li>
            <li>
              <h4 className="font-semibold text-sm">Taller: Diseño de APIs RESTful</h4>
              <p className="text-xs text-muted-foreground">22 de Julio, 2023</p>
            </li>
            <li>
              <h4 className="font-semibold text-sm">Meetup: Desarrollo Full Stack</h4>
              <p className="text-xs text-muted-foreground">5 de Agosto, 2023</p>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

