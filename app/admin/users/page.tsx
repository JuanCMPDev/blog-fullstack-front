import { UsersTable } from "@/components/admin/UsersTable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

export default function UsersAdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Administración de Usuarios</h1>
      </div>
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted">
          <CardTitle>Lista de Usuarios</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <UsersTable />
        </CardContent>
      </Card>
    </div>
  )
}

