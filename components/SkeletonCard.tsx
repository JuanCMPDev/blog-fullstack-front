import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function SkeletonCard() {
  return (
    <Card className="flex flex-col h-full">
      <Skeleton className="w-full aspect-video" />
      <CardHeader className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full mt-2" />
      </CardContent>
      <CardFooter className="flex justify-between mt-auto">
        <div className="flex space-x-4">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-8" />
        </div>
        <Skeleton className="h-8 w-24" />
      </CardFooter>
    </Card>
  )
}

