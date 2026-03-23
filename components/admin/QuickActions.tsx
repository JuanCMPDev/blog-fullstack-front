'use client'

import Link from 'next/link'
import { PenSquare, Users, BookOpen, FolderKanban, GraduationCap, LayoutDashboard } from 'lucide-react'

const actions = [
  {
    label: 'Crear Post',
    href: '/admin/posts/create',
    icon: PenSquare,
    color: 'text-primary bg-primary/10 group-hover:bg-primary/20',
  },
  {
    label: 'Gestionar Posts',
    href: '/admin/posts',
    icon: LayoutDashboard,
    color: 'text-blue-500 bg-blue-500/10 group-hover:bg-blue-500/20',
  },
  {
    label: 'Usuarios',
    href: '/admin/users',
    icon: Users,
    color: 'text-emerald-500 bg-emerald-500/10 group-hover:bg-emerald-500/20',
  },
  {
    label: 'Cursos',
    href: '/admin/courses',
    icon: BookOpen,
    color: 'text-amber-500 bg-amber-500/10 group-hover:bg-amber-500/20',
  },
  {
    label: 'Exámenes',
    href: '/admin/exams',
    icon: GraduationCap,
    color: 'text-purple-500 bg-purple-500/10 group-hover:bg-purple-500/20',
  },
  {
    label: 'Proyectos',
    href: '/admin/projects',
    icon: FolderKanban,
    color: 'text-rose-500 bg-rose-500/10 group-hover:bg-rose-500/20',
  },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <Link
            key={action.href}
            href={action.href}
            className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 bg-card/60 hover:border-border hover:shadow-sm transition-all"
          >
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors ${action.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
