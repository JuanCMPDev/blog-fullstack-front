"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchRecentStats, type RecentStats } from "@/lib/recent-stats-data"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, MessageSquare, Trophy, Users, MousePointer2, Clock, TrendingUp } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

const TrafficStatsSkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="h-4 w-1/2" />
  </div>
)

const PopularPostsSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-center space-x-4">
        <Skeleton className="h-24 w-24 rounded-lg" />
        <div className="flex-grow space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <div className="flex justify-between">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      </div>
    ))}
  </div>
)

export function RecentStats() {
  const [recentStats, setRecentStats] = useState<RecentStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadRecentStats = async () => {
      try {
        const data = await fetchRecentStats()
        setRecentStats(data)
      } catch (error) {
        console.error("Error fetching recent stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadRecentStats()
  }, [])

  const getPodiumColor = (index: number) => {
    switch (index) {
      case 0:
        return "text-yellow-500"
      case 1:
        return "text-gray-400"
      case 2:
        return "text-amber-600"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <Card className="col-span-3 max-h-[620px] bg-gradient-to-br from-background to-secondary/20">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center space-x-2">
          <TrendingUp className="w-6 h-6" />
          <span>Estadísticas Recientes</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-8 overflow-auto">
        {isLoading ? (
          <div className="space-y-6">
            <TrafficStatsSkeleton />
            <PopularPostsSkeleton />
          </div>
        ) : recentStats ? (
          <>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Tráfico Total</h3>
                <Badge
                  variant="outline"
                  className={`text-sm font-medium ${recentStats.trafficStats.changePercentage >= 0
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                    } px-2 py-1 rounded-full`}
                >
                  {recentStats.trafficStats.changePercentage >= 0 ? "▲" : "▼"}
                  {Math.abs(recentStats.trafficStats.changePercentage)}% vs. mes pasado
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="overflow-hidden max-h-[120px]">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2">
                    <Users className="h-5 w-5 text-white mb-1" />
                    <h4 className="text-white font-semibold text-xs">Visitas únicas</h4>
                  </div>
                  <CardContent className="pt-2">
                    <p className="text-xl font-bold">{recentStats.trafficStats.uniqueVisitors.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Visitantes este mes</p>
                  </CardContent>
                </Card>
                <Card className="overflow-hidden max-h-[120px]">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-2">
                    <MousePointer2 className="h-5 w-5 text-white mb-1" />
                    <h4 className="text-white font-semibold text-xs">Páginas vistas</h4>
                  </div>
                  <CardContent className="pt-2">
                    <p className="text-xl font-bold">{recentStats.trafficStats.pageViews.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Vistas totales</p>
                  </CardContent>
                </Card>
                <Card className="overflow-hidden max-h-[120px]">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2">
                    <Clock className="h-5 w-5 text-white mb-1" />
                    <h4 className="text-white font-semibold text-xs">Tiempo promedio</h4>
                  </div>
                  <CardContent className="pt-2">
                    <p className="text-xl font-bold">{recentStats.trafficStats.averageTimeOnPage}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Por sesión</p>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Posts Populares</h3>
              <Carousel className="w-full max-w-xs mx-auto">
                <CarouselContent>
                  {recentStats.popularPosts.map((post, index) => (
                    <CarouselItem key={post.id}>
                      <Card
                        className="overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg"
                        onClick={() => console.log(`Clicked on post: ${post.title}`)}
                      >
                        <div className="relative">
                          <div className="absolute top-2 left-2 z-10">
                            <Badge variant="secondary" className={`text-xs font-bold ${getPodiumColor(index)}`}>
                              <Trophy className="w-3 h-3 mr-1" />#{index + 1}
                            </Badge>
                          </div>
                          <div className="relative w-full h-32">
                            <Image
                              src={post.image || "/placeholder-post-image.jpeg"}
                              alt={post.title}
                              layout="fill"
                              objectFit="cover"
                            />
                          </div>
                          <CardContent className="p-3">
                            <h4 className="font-semibold text-sm mb-2 line-clamp-2">{post.title}</h4>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span className="flex items-center">
                                <Eye className="h-3 w-3 mr-1" />
                                {post.views.toLocaleString()}
                              </span>
                              <span className="flex items-center">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                {post.comments}
                              </span>
                              <Badge variant="outline" className="text-[10px]">
                                {post.category}
                              </Badge>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground">Error al cargar las estadísticas recientes</div>
        )}
      </CardContent>
    </Card>
  )
}

