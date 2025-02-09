import { LayoutDashboard } from "lucide-react"
import { Overview } from "@/components/admin/Overview"
import { DashboardCards } from "@/components/admin/DashboardCards"
import { RecentStats } from "@/components/admin/RecentStats"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminDashboard() {
  return (
    <div className="space-y-6 min-h-[calc(100vh-4rem)]">
      <div className="border-b pb-4">
        <div className="flex items-center space-x-2">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <p className="text-muted-foreground mt-2">Bienvenido al panel de administración</p>
        <div className="mt-4 h-1 w-20 bg-gradient-to-r from-primary to-primary-foreground/20 rounded-full" />
      </div>

      <DashboardCards />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 flex flex-col">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <Overview />
          </CardContent>
        </Card>
        <RecentStats />
      </div>
    </div>
  )
}

