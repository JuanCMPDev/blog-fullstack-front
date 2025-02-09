export interface CardData {
  title: string
  value: number
  change: number
  icon: string
}

export interface DashboardData {
  totalUsers: CardData
  totalPosts: CardData
  activeUsers: CardData
  engagementRate: CardData
}

export const mockDashboardData: DashboardData = {
  totalUsers: {
    title: "Total Usuarios",
    value: 1234,
    change: 10,
    icon: "Users",
  },
  totalPosts: {
    title: "Total Posts",
    value: 567,
    change: 20,
    icon: "FileText",
  },
  activeUsers: {
    title: "Usuarios Activos",
    value: 783,
    change: 5,
    icon: "Activity",
  },
  engagementRate: {
    title: "Tasa de Interacción",
    value: 24.5,
    change: 2,
    icon: "BarChart",
  },
}

export async function fetchDashboardData(): Promise<DashboardData> {
  // Simulating an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockDashboardData)
    }, 1000)
  })
}

