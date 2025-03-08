import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export const ProfileSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Card className="mb-8 overflow-hidden shadow-lg">
        <Skeleton className="h-32 sm:h-48 md:h-64 lg:h-72 w-full" />
        <CardContent className="relative px-4 md:px-6 pt-0 md:pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-20 md:-mt-24 lg:-mt-28 relative z-10 px-2 sm:px-6">
            <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-background rounded-full" />
            <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
              <Skeleton className="h-6 md:h-8 w-40 sm:w-48 lg:w-60 mb-2" />
              <Skeleton className="h-4 w-32 sm:w-40" />
            </div>
            <Skeleton className="w-32 h-8 mt-4 sm:mt-0 sm:ml-auto" />
          </div>
          <div className="mt-6 px-4 md:px-6">
            <div className="flex flex-wrap gap-4 mb-6">
              <Skeleton className="h-4 w-24 sm:w-32" />
              <Skeleton className="h-4 w-32 sm:w-40" />
            </div>
            <div className="mb-6">
              <div className="flex space-x-4">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
            </div>
            <div className="mb-6">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </div>
            <div className="mt-6 mb-6">
              <Skeleton className="h-5 w-24 mb-2" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-6 w-16 sm:w-20" />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mb-6">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
                  <Skeleton className="w-full sm:w-36 md:w-48 h-40 sm:h-28 md:h-32 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 md:h-6 w-full sm:w-3/4" />
                    <Skeleton className="h-4 w-full sm:w-5/6" />
                    <Skeleton className="h-4 w-32" />
                    <div className="flex items-center space-x-4 mt-3">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <Skeleton className="h-8 w-24 mb-1" />
                  <Skeleton className="h-4 w-full max-w-[180px]" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

