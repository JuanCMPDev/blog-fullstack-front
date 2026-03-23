export interface DashboardKPIs {
  totalUsers: number
  totalPosts: number
  totalComments: number
  totalCourses: number
  usersChange: number
  postsChange: number
  commentsChange: number
  coursesChange: number
}

export interface GrowthPoint {
  month: string
  users: number
  posts: number
}

export interface DashboardActivity {
  id: number
  type: 'POST_CREATED' | 'COMMENTED' | 'LIKED' | 'SAVED_POST'
  description: string
  createdAt: string
  user: {
    id: string
    nick: string
    name: string
    avatar: string | null
  }
}

export interface TopPost {
  id: number
  title: string
  slug: string
  likes: number
  commentsCount: number
  author: {
    name: string
    nick: string
    avatar: string | null
  }
  createdAt: string
}

export interface ContentStatus {
  draft: number
  published: number
  scheduled: number
}

export interface DashboardStats {
  kpis: DashboardKPIs
  growthChart: GrowthPoint[]
  recentActivity: DashboardActivity[]
  topPosts: TopPost[]
  contentStatus: ContentStatus
}
