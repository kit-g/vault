import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface PaginatorProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function Paginator({ currentPage, totalItems, itemsPerPage, onPageChange }: PaginatorProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="flex items-center justify-center gap-2 mt-8">
      {/* Previous Button */ }
      <button
        onClick={ () => onPageChange(currentPage - 1) }
        disabled={ currentPage === 1 }
        className="btn-paginator"
        aria-label="Previous page"
      >
        <ChevronLeft size={ 20 }/>
      </button>

      {/* Page Number Buttons */ }
      { pages.map(page => (
        <button
          key={ page }
          onClick={ () => onPageChange(page) }
          // Conditionally apply the 'active' class
          className={ clsx('btn-paginator', { 'active': currentPage === page }) }
          aria-current={ currentPage === page ? 'page' : undefined }
        >
          { page }
        </button>
      )) }

      {/* Next Button */ }
      <button
        onClick={ () => onPageChange(currentPage + 1) }
        disabled={ currentPage === totalPages }
        className="btn-paginator"
        aria-label="Next page"
      >
        <ChevronRight size={ 20 }/>
      </button>
    </nav>
  );
}