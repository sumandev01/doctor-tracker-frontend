import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Reusable Atomic Button Component
 * Follows Rule 4 (DRY), Rule 5 (Props contract & attribute forwarding),
 * Rule 9 (WCAG semantic button), Rule 10 (Fluid micro-interactions).
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon = null,
  className = '',
  disabled = false,
  type = 'button',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]';

  const variants = {
    primary:
      'bg-teal-600 hover:bg-teal-700 hover:brightness-105 text-white shadow-sm shadow-teal-600/25 focus:ring-teal-500 border border-transparent',
    secondary:
      'bg-slate-800 hover:bg-slate-900 hover:brightness-110 text-white shadow-sm focus:ring-slate-700 border border-transparent',
    outline:
      'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 hover:border-slate-400 shadow-xs focus:ring-teal-500',
    danger:
      'bg-rose-600 hover:bg-rose-700 hover:brightness-105 text-white shadow-sm shadow-rose-600/25 focus:ring-rose-500 border border-transparent',
    dangerOutline:
      'bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 hover:border-rose-300 focus:ring-rose-500',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-transparent focus:ring-slate-400',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-xs px-3.5 py-2.5 gap-2',
    lg: 'text-sm px-5 py-3 gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant] || variants.primary, sizes[size] || sizes.md, className)}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-0.5 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
}
