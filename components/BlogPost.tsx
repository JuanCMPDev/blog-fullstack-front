import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, MessageSquare, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface BlogPostProps {
  id: number
  title: string
  excerpt: string
  votes: number
  comments: number
  image: string
  tags: string[]
}

export function BlogPost({ id, title, excerpt, votes, comments, image, tags }: BlogPostProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative w-full pt-[56.25%]">
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          layout="fill"
          objectFit="cover"
          className="transition-transform hover:scale-105"
        />
      </div>
      <CardHeader>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
        <h3 className="text-xl font-semibold leading-none tracking-tight">{title}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">{excerpt}</p>
      </CardContent>
      <CardFooter className="flex justify-between mt-auto">
        <div className="flex space-x-4 text-sm text-muted-foreground">
          <span className="flex items-center">
            <ThumbsUp className="mr-1 h-4 w-4" />
            {votes}
          </span>
          <span className="flex items-center">
            <MessageSquare className="mr-1 h-4 w-4" />
            {comments}
          </span>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/post/${id}`}>
            Leer más <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

