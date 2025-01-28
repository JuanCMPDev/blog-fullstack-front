import { AdminSidebar } from "@/components/admin/AdminSidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
        <div className="flex min-h-full w-full items-start justify-center p-8">
          <div className="w-full max-w-7xl space-y-8">{children}</div>
        </div>
      </main>
    </div>
  )
}

