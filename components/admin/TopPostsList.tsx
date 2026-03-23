'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, MessageSquare, Trophy } from 'lucide-react'
import { getAvatarUrl } from '@/lib/utils'
import Link from 'next/link'
import type { TopPost } from '@/lib/dashboard-types'

interface Props {
  posts: TopPost[]
}

const rankColors = [
  'text-amber-500',   // 1st - gold
  'text-slate-400',   // 2nd - silver
  'text-orange-600',  // 3rd - bronze
  'text-muted-foreground',
  'text-muted-foreground',
]

export function TopPostsList({ posts }: Props) {
  return (
    <Card className="border-border/50 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          Top posts por likes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {posts.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-sm text-muted-foreground px-6">
            No hay posts publicados aún
          </div>
        ) : (
          <div className="px-4 pb-4 space-y-1">
            {posts.map((post, i) => (
              <div
                key={post.id}
                className="flex items-center gap-3 py-2.5 border-b border-border/30 last:border-0"
              >
                {/* Rank */}
                <span className={`text-sm font-bold w-5 text-center shrink-0 tabular-nums ${rankColors[i]}`}>
                  {i + 1}
                </span>

                {/* Author avatar */}
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarImage src={getAvatarUrl(post.author.avatar)} alt={post.author.name} />
                  <AvatarFallback className="text-[10px]">
                    {post.author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                {/* Title + author */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/post/${post.slug}`}
                    className="text-sm font-medium hover:text-primary transition-colors line-clamp-1"
                  >
                    {post.title}
                  </Link>
                  <p className="text-xs text-muted-foreground truncate">
                    {post.author.name}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Heart className="h-3 w-3 text-red-500" />
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    {post.commentsCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
