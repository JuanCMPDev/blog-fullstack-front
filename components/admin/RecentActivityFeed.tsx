'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PenSquare, MessageSquare, Heart, Bookmark, Activity } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { getAvatarUrl } from '@/lib/utils'
import Link from 'next/link'
import type { DashboardActivity } from '@/lib/dashboard-types'

interface Props {
  activities: DashboardActivity[]
}

const activityConfig = {
  POST_CREATED: {
    icon: PenSquare,
    color: 'bg-primary/10 text-primary',
  },
  COMMENTED: {
    icon: MessageSquare,
    color: 'bg-blue-500/10 text-blue-500',
  },
  LIKED: {
    icon: Heart,
    color: 'bg-red-500/10 text-red-500',
  },
  SAVED_POST: {
    icon: Bookmark,
    color: 'bg-amber-500/10 text-amber-500',
  },
}

export function RecentActivityFeed({ activities }: Props) {
  return (
    <Card className="border-border/50 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Actividad reciente
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {activities.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-sm text-muted-foreground px-6">
            No hay actividad reciente
          </div>
        ) : (
          <ScrollArea className="h-[340px]">
            <div className="px-4 pb-4 space-y-1">
              {activities.map((activity, i) => {
                const config = activityConfig[activity.type] ?? {
                  icon: Activity,
                  color: 'bg-muted text-muted-foreground',
                }
                const Icon = config.icon
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 py-2.5 border-b border-border/30 last:border-0"
                  >
                    <div className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 mt-0.5 ${config.color}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Avatar className="h-5 w-5 shrink-0">
                          <AvatarImage src={getAvatarUrl(activity.user.avatar)} alt={activity.user.name} />
                          <AvatarFallback className="text-[10px]">
                            {activity.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <Link
                          href={`/profile/${activity.user.nick}`}
                          className="text-xs font-medium hover:text-primary transition-colors truncate"
                        >
                          {activity.user.name}
                        </Link>
                      </div>
                      <p className="text-xs text-muted-foreground leading-snug break-words">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap shrink-0 mt-0.5">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: false, locale: es })}
                    </span>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
