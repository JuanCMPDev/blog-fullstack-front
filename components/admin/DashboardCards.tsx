"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Activity, BarChart } from "lucide-react"
import { fetchDashboardData, type CardData, type DashboardData } from "@/lib/dashboard-data"
import type React from "react"
import { Skeleton } from "@/components/ui/skeleton"

const iconMap: { [key: string]: React.ElementType } = {
  Users,
  FileText,
  Activity,
  BarChart,
}

const DashboardCard = ({ data }: { data: CardData }) => {
  const Icon = iconMap[data.icon]
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{data.title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{data.value.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">
          {data.change > 0 ? "+" : ""}
          {data.change}% desde el mes pasado
        </p>
      </CardContent>
    </Card>
  )
}

const DashboardCardSkeleton = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-[100px] mb-2" />
        <Skeleton className="h-4 w-[70px]" />
      </CardContent>
    </Card>
  )
}

export function DashboardCards() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await fetchDashboardData()
        setDashboardData(data)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {isLoading ? (
        <>
          <DashboardCardSkeleton />
          <DashboardCardSkeleton />
          <DashboardCardSkeleton />
          <DashboardCardSkeleton />
        </>
      ) : dashboardData ? (
        <>
          <DashboardCard data={dashboardData.totalUsers} />
          <DashboardCard data={dashboardData.totalPosts} />
          <DashboardCard data={dashboardData.activeUsers} />
          <DashboardCard data={dashboardData.engagementRate} />
        </>
      ) : (
        <div>Error loading dashboard data</div>
      )}
    </div>
  )
}

