import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  useEffect(() => {
    // This ensures responsive behavior on mount
    // The responsive logic is handled through breakpoints below
  }, []);

  const pages = [];
  // For mobile, show 2 pages; for tablet, show 3; for desktop, show 5
  let maxVisiblePages;
  if (window.innerWidth < 640) {
    maxVisiblePages = 2; // Very mobile
  } else if (window.innerWidth < 768) {
    maxVisiblePages = 3; // Tablet
  } else {
    maxVisiblePages = 5; // Desktop
  }
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 md:gap-2 mt-8 flex-wrap px-2">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-2 py-2 sm:px-3 sm:py-2 text-sm sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Halaman sebelumnya"
      >
        <span className="hidden sm:inline">Sebelumnya</span>
        <ChevronLeft className="w-5 h-5 sm:hidden" />
      </button>

      {/* First page button and ellipsis */}
      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-2.5 py-2 sm:px-3 sm:py-2 text-sm sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            1
          </button>
          {startPage > 2 && <span className="px-1 sm:px-2 text-sm text-gray-500">...</span>}
        </>
      )}

      {/* Page numbers */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-2.5 py-2 sm:px-3 sm:py-2 text-sm sm:text-sm font-medium rounded-md transition-colors ${
            currentPage === page
              ? 'text-white bg-primary-600 border border-primary-600'
              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Last page button and ellipsis */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-1 sm:px-2 text-sm text-gray-500">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-2.5 py-2 sm:px-3 sm:py-2 text-sm sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-2 py-2 sm:px-3 sm:py-2 text-sm sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Halaman selanjutnya"
      >
        <span className="hidden sm:inline">Selanjutnya</span>
        <ChevronRight className="w-5 h-5 sm:hidden" />
      </button>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default Pagination;