import { Sidebar } from "@/components/layout/Sidebar"

export default function PostLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-dot-pattern">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <main className="w-full lg:w-2/3">{children}</main>
          <aside className="w-full lg:w-1/3">
            <div className="lg lg:top-24">
              <Sidebar />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

