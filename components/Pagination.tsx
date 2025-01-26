import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  const maxVisiblePages = 5

  const getPageNumbers = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const leftSide = Math.floor(maxVisiblePages / 2)
    const rightSide = maxVisiblePages - leftSide

    if (currentPage <= leftSide) {
      return [...Array.from({ length: maxVisiblePages - 1 }, (_, i) => i + 1), totalPages]
    }

    if (currentPage > totalPages - rightSide) {
      return [1, ...Array.from({ length: maxVisiblePages - 1 }, (_, i) => totalPages - maxVisiblePages + i + 1)]
    }

    return [1, currentPage - 1, currentPage, currentPage + 1, totalPages]
  }

  const pageNumbers = getPageNumbers()

  return (
    <nav
      className={cn("flex flex-wrap justify-center items-center space-x-1 sm:space-x-2", className)}
      aria-label="Pagination"
    >
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-8 h-8 sm:w-10 sm:h-10"
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {pageNumbers.map((pageNumber, index) => {
        if (index > 0 && pageNumber - pageNumbers[index - 1] > 1) {
          return (
            <span key={`ellipsis-${pageNumber}`} className="px-2 py-2">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </span>
          )
        }
        return (
          <Button
            key={pageNumber}
            variant={currentPage === pageNumber ? "default" : "outline"}
            size="icon"
            onClick={() => onPageChange(pageNumber)}
            className={cn("w-8 h-8 sm:w-10 sm:h-10", currentPage === pageNumber && "pointer-events-none")}
            aria-label={`Ir a la página ${pageNumber}`}
            aria-current={currentPage === pageNumber ? "page" : undefined}
          >
            {pageNumber}
          </Button>
        )
      })}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-8 h-8 sm:w-10 sm:h-10"
        aria-label="Página siguiente"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  )
}

