'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Users, FileText, MessageSquare, BookOpen, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { DashboardKPIs } from '@/lib/dashboard-types'

interface Props {
  kpis: DashboardKPIs
}

const cards = [
  {
    key: 'totalUsers' as const,
    changeKey: 'usersChange' as const,
    label: 'Usuarios',
    icon: Users,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    key: 'totalPosts' as const,
    changeKey: 'postsChange' as const,
    label: 'Posts',
    icon: FileText,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    key: 'totalComments' as const,
    changeKey: 'commentsChange' as const,
    label: 'Comentarios',
    icon: MessageSquare,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    key: 'totalCourses' as const,
    changeKey: 'coursesChange' as const,
    label: 'Cursos',
    icon: BookOpen,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
]

function ChangeIndicator({ value }: { value: number }) {
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" /> Sin cambios
      </span>
    )
  }
  const positive = value > 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${positive ? 'text-emerald-500' : 'text-red-500'}`}>
      {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {positive ? '+' : ''}{value}% vs mes anterior
    </span>
  )
}

export function DashboardKPICards({ kpis }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon
        const value = kpis[card.key]
        const change = kpis[card.changeKey]
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
          >
            <Card className="border-border/50">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${card.bg}`}>
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                </div>
                <p className="text-3xl font-bold tracking-tight">
                  {value.toLocaleString('es-ES')}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5 mb-2">{card.label}</p>
                <ChangeIndicator value={change} />
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
