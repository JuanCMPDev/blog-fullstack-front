export interface TrafficStats {
  uniqueVisitors: number
  pageViews: number
  averageTimeOnPage: string
  changePercentage: number
}

export interface PopularPost {
  id: number
  title: string
  views: number
  comments: number
  category: string
  image?: string
}

export interface RecentStats {
  trafficStats: TrafficStats
  popularPosts: PopularPost[]
}

const mockRecentStats: RecentStats = {
  trafficStats: {
    uniqueVisitors: 12500,
    pageViews: 28750,
    averageTimeOnPage: "2m 35s",
    changePercentage: 12,
  },
  popularPosts: [
    {
      id: 1,
      title: "10 Tips para Mejorar tu Productividad como Desarrollador",
      views: 1500,
      comments: 45,
      category: "Productividad",
      image: "/placeholder-post-image.jpeg",
    },
    {
      id: 2,
      title: "Introducción a React Hooks: useEffect Explicado",
      views: 1200,
      comments: 38,
      category: "React",
      image: "/placeholder-post-image.jpeg",
    },
    {
      id: 3,
      title: "Cómo Optimizar el Rendimiento de tu Sitio Web",
      views: 980,
      comments: 27,
      category: "Optimización",
      image: "/placeholder-post-image.jpeg",
    },
  ],
}

export async function fetchRecentStats(): Promise<RecentStats> {
  // Simulating an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockRecentStats)
    }, 1000)
  })
}

