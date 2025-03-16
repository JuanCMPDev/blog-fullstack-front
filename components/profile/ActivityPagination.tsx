import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface ActivityPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function ActivityPagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  disabled = false
}: ActivityPaginationProps) {
  // No mostramos paginación si solo hay una página
  if (totalPages <= 1) return null;

  // Función para generar rangos de páginas
  const getPageRange = () => {
    const maxVisiblePages = 5;
    const pageNumbers: (number | 'ellipsis')[] = [];

    // Caso 1: Pocas páginas, mostramos todas
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
      return pageNumbers;
    }

    // Caso 2: Muchas páginas, mostramos algunas con ellipsis
    pageNumbers.push(1); // Siempre mostramos la primera página

    // Si la página actual está cerca del inicio
    if (currentPage <= 3) {
      pageNumbers.push(2, 3);
      pageNumbers.push('ellipsis');
      pageNumbers.push(totalPages);
    } 
    // Si la página actual está cerca del final
    else if (currentPage >= totalPages - 2) {
      pageNumbers.push('ellipsis');
      pageNumbers.push(totalPages - 2, totalPages - 1, totalPages);
    } 
    // Si la página actual está en el medio
    else {
      pageNumbers.push('ellipsis');
      pageNumbers.push(currentPage - 1, currentPage, currentPage + 1);
      pageNumbers.push('ellipsis');
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2 mt-4">
      <div className="flex items-center justify-center space-x-2">
        {/* Botón anterior */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={disabled || currentPage === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Página anterior</span>
        </Button>

        {/* Botones de páginas */}
        {getPageRange().map((page, idx) =>
          page === 'ellipsis' ? (
            <span key={`ellipsis-${idx}`} className="px-2">
              <MoreHorizontal className="h-4 w-4" />
            </span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              disabled={disabled}
              className="h-8 w-8 p-0"
            >
              {page}
            </Button>
          )
        )}

        {/* Botón siguiente */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={disabled || currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Página siguiente</span>
        </Button>
      </div>
      
      <div className="text-xs text-muted-foreground">
        {totalItems} {totalItems === 1 ? 'actividad' : 'actividades'} en total
      </div>
    </div>
  );
} 