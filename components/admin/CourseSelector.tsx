"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCourses } from "@/hooks/use-courses"
import { BookOpen } from "lucide-react"

interface CourseSelectorProps {
  courseId: string | null
  courseOrder: number | null
  onChange: (courseId: string | null, courseOrder: number | null) => void
}

const NONE_VALUE = "__none__"

export function CourseSelector({ courseId, courseOrder, onChange }: CourseSelectorProps) {
  const { courses, isLoading } = useCourses()
  const [localOrder, setLocalOrder] = useState<string>(courseOrder?.toString() ?? "")

  useEffect(() => {
    setLocalOrder(courseOrder?.toString() ?? "")
  }, [courseOrder])

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium flex items-center gap-2">
        <BookOpen className="h-4 w-4" />
        Curso / Serie
      </label>
      <div className="flex gap-3">
        <div className="flex-1">
          <Select
            value={courseId ?? NONE_VALUE}
            onValueChange={(value) => {
              if (value === NONE_VALUE) {
                onChange(null, null)
                setLocalOrder("")
              } else {
                onChange(value, courseOrder)
              }
            }}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Cargando cursos..." : "Sin curso asignado"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE_VALUE}>Sin curso asignado</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {courseId && (
          <div className="w-28">
            <Input
              type="number"
              min={1}
              placeholder="Orden"
              value={localOrder}
              onChange={(e) => {
                setLocalOrder(e.target.value)
                const num = parseInt(e.target.value, 10)
                onChange(courseId, isNaN(num) ? null : num)
              }}
            />
          </div>
        )}
      </div>
      {courseId && (
        <p className="text-xs text-muted-foreground">
          El orden determina la posicion de este post dentro de la serie.
        </p>
      )}
    </div>
  )
}
