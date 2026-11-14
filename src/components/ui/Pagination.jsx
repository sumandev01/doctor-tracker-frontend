'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Reusable Pagination Component (PDF Page 2 & 3 Compliance)
 * Generates dynamic page pills with ellipses and Prev/Next controls
 */
export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems = 0,
  itemsPerPage = 10,
  className = '',
}) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers with ellipses
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className={cn('p-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3', className)}>
      <p className="text-xs text-slate-500">
        Showing <strong className="text-slate-900 font-semibold">{totalItems > 0 ? startItem : 0}</strong> to{' '}
        <strong className="text-slate-900 font-semibold">{endItem}</strong> of{' '}
        <strong className="text-slate-900 font-semibold">{totalItems}</strong> records
      </p>

      <div className="flex items-center gap-1 text-xs select-none">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium cursor-pointer active:scale-95 shadow-2xs"
        >
          Previous
        </button>

        {getPageNumbers().map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={cn(
                'min-w-[32px] h-8 px-2.5 rounded-lg font-semibold transition cursor-pointer active:scale-95',
                currentPage === page
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/25 ring-2 ring-teal-500/30'
                  : 'border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 shadow-2xs'
              )}
            >
              {page}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium cursor-pointer active:scale-95 shadow-2xs"
        >
          Next
        </button>
      </div>
    </div>
  );
}
