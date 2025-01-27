import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThumbsUp, MessageSquare, ArrowRight, Calendar, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Post } from "@/lib/types"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Tag } from "@/components/Tag"

export function BlogPost({
  id,
  title,
  excerpt,
  likes,
  comments,
  image,
  tags,
  author,
  publishDate,
  readTime,
}: Post) {
  const isMobile = useMediaQuery("(max-width: 640px)")
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative w-full pt-[56.25%] overflow-hidden group">
        <Link
          href={`/post/${id}`}
          className={`block ${isMobile ? "cursor-default active:cursor-pointer" : ""}`}
          {...(isMobile ? { onTouchStart: () => {} } : {})}
        >
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
        </Link>
      </div>
      <CardHeader className="pb-2">
        <Link href={`/post/${id}`} className="hover:underline">
          <h3 className="text-xl font-semibold leading-tight tracking-tight line-clamp-2">{title}</h3>
        </Link>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{excerpt}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <Tag key={index} name={tag} />
          ))}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{author.name}</p>
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span className="mr-2">{format(new Date(publishDate), "d MMM, yyyy", { locale: es })}</span>
              <Clock className="h-3 w-3 mr-1" />
              <span>{readTime} min</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-4 border-t">
        <div className="flex space-x-4 text-sm text-muted-foreground">
          <span className="flex items-center">
            <ThumbsUp className="mr-1 h-4 w-4" />
            {likes}
          </span>
          <span className="flex items-center">
            <MessageSquare className="mr-1 h-4 w-4" />
            {comments}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-primary hover:text-primary-foreground hover:bg-primary transition-colors duration-300"
        >
          <Link href={`/post/${id}`}>
            Leer más <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

