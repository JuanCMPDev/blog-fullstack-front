"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Inbox, type LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed border-border/40 rounded-xl",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>

      <h3 className="font-headline font-semibold text-lg mb-1">{title}</h3>

      {description && (
        <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      )}

      {action && (
        <div className="mt-5">
          {action.href ? (
            <Button variant="outline" size="sm" asChild className="border-border/30 hover:bg-primary/10">
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={action.onClick} className="border-border/30 hover:bg-primary/10">
              {action.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  )
}
