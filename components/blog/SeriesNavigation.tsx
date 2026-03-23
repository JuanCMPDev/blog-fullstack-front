"use client"

import Link from "next/link"
import { useSeriesNavigation, type SeriesNavigation } from "@/hooks/use-courses"
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SeriesNavigationProps {
  postId: number
}

export function SeriesNavigationBar({ postId }: SeriesNavigationProps) {
  const navigation = useSeriesNavigation(postId)

  if (!navigation?.course) return null

  return (
    <div className="border rounded-lg p-4 mb-6 bg-secondary/30">
      {/* Course header */}
      <Link
        href={`/courses/${navigation.course.slug}`}
        className="flex items-center gap-2 text-sm font-medium text-primary hover:underline mb-3"
      >
        <BookOpen className="h-4 w-4" />
        {navigation.course.title}
      </Link>

      {/* Prev / Next */}
      <div className="flex justify-between items-center gap-4">
        {navigation.prev ? (
          <Button variant="ghost" size="sm" asChild className="flex-1 justify-start">
            <Link href={`/post/${navigation.prev.slug}`}>
              <ChevronLeft className="h-4 w-4 mr-1 shrink-0" />
              <span className="truncate text-xs">{navigation.prev.title}</span>
            </Link>
          </Button>
        ) : (
          <div className="flex-1" />
        )}

        {navigation.next ? (
          <Button variant="ghost" size="sm" asChild className="flex-1 justify-end">
            <Link href={`/post/${navigation.next.slug}`}>
              <span className="truncate text-xs">{navigation.next.title}</span>
              <ChevronRight className="h-4 w-4 ml-1 shrink-0" />
            </Link>
          </Button>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </div>
  )
}
