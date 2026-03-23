'use client'

import { LayoutDashboard, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDashboard } from '@/hooks/use-dashboard'
import { DashboardKPICards } from '@/components/admin/DashboardKPICards'
import { GrowthChart } from '@/components/admin/GrowthChart'
import { ContentStatusChart } from '@/components/admin/ContentStatusChart'
import { RecentActivityFeed } from '@/components/admin/RecentActivityFeed'
import { TopPostsList } from '@/components/admin/TopPostsList'
import { QuickActions } from '@/components/admin/QuickActions'
import { DashboardSkeleton } from '@/components/admin/DashboardSkeleton'

export default function AdminDashboard() {
  const { stats, isLoading, error, refetch } = useDashboard()

  return (
    <div className="space-y-6 min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">Panel de administración</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refrescar
        </Button>
      </div>

      {isLoading && !stats && <DashboardSkeleton />}

      {error && !stats && (
        <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
          <p className="text-muted-foreground text-sm">No se pudieron cargar las estadísticas.</p>
          <Button variant="outline" size="sm" onClick={refetch}>Reintentar</Button>
        </div>
      )}

      {stats && (
        <>
          {/* KPI Cards */}
          <DashboardKPICards kpis={stats.kpis} />

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            <div className="lg:col-span-4">
              <GrowthChart data={stats.growthChart} />
            </div>
            <div className="lg:col-span-3">
              <ContentStatusChart data={stats.contentStatus} />
            </div>
          </div>

          {/* Data row */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            <div className="lg:col-span-4">
              <RecentActivityFeed activities={stats.recentActivity} />
            </div>
            <div className="lg:col-span-3">
              <TopPostsList posts={stats.topPosts} />
            </div>
          </div>

          {/* Quick Actions */}
          <QuickActions />
        </>
      )}
    </div>
  )
}
