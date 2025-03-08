"use client"

import { PostsContainer } from "@/components/admin/PostsContainer"
import { PostsTable } from "@/components/admin/PostsTable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, FileText, Clock, Calendar, X } from "lucide-react"
import Link from "next/link"
import { Pagination } from "@/components/common/Pagination"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ManagePostsPage() {
  return (
    <PostsContainer
      render={({
        posts,
        isLoading,
        currentPage,
        totalPages,
        filter,
        searchTerm,
        activeSearchTerm,
        handlers,
      }) => {
        return (
          <main className="space-y-6 p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 className="text-3xl font-bold">Posts</h1>
              <Link href="/admin/posts/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Post
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <FilterButton 
                  isActive={filter === 'published'}
                  onClick={() => handlers.setFilter('published')}
                  icon={<Clock className="h-4 w-4 mr-1.5" />}
                  label="Publicados"
                  count={filter === 'published' ? posts.length : null}
                />
                <FilterButton 
                  isActive={filter === 'scheduled'}
                  onClick={() => handlers.setFilter('scheduled')}
                  icon={<Calendar className="h-4 w-4 mr-1.5" />}
                  label="Programados"
                  count={filter === 'scheduled' ? posts.length : null}
                />
                <FilterButton 
                  isActive={filter === 'draft'}
                  onClick={() => handlers.setFilter('draft')}
                  icon={<FileText className="h-4 w-4 mr-1.5" />}
                  label="Borradores"
                  count={filter === 'draft' ? posts.length : null}
                />
              </div>
              
              <div className="relative w-full sm:w-72">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar posts..."
                    className={cn(
                      "w-full pl-8", 
                      searchTerm && "pr-10",
                      "bg-background border-border shadow-sm"
                    )}
                    value={searchTerm}
                    onChange={(e) => handlers.setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button 
                      type="button"
                      onClick={() => handlers.clearSearch()}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Limpiar búsqueda"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {activeSearchTerm && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Search className="h-3.5 w-3.5" />
                <span>Resultados para: </span>
                <Badge variant="secondary" className="px-2 py-0.5 text-xs">
                  {activeSearchTerm}
                </Badge>
                {posts.length > 0 ? (
                  <span className="ml-2">({posts.length} encontrados)</span>
                ) : (
                  <span className="ml-2">No se encontraron resultados</span>
                )}
              </div>
            )}

            <Card className="p-6">
              <PostsTable
                posts={posts}
                onDelete={handlers.handleDelete}
                onEdit={handlers.handleEdit}
                onStatusChange={handlers.handleStatusChange}
                isLoading={isLoading}
              />
            </Card>

            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlers.handlePageChange}
                />
              </div>
            )}
          </main>
        );
      }}
    />
  )
}

interface FilterButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number | null;
}

function FilterButton({ isActive, onClick, icon, label, count }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center px-3 py-2 rounded-md font-medium text-sm transition-colors",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-background hover:bg-muted text-foreground/80 hover:text-foreground border"
      )}
    >
      {icon}
      {label}
      {count !== null && (
        <span className={cn(
          "ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-medium", 
          isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted-foreground/20 text-foreground"
        )}>
          {count}
        </span>
      )}
    </button>
  );
}

