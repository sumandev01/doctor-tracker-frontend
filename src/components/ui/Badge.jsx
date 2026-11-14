import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Reusable Status & Medical Condition Badge Component
 * Used for Doctor Status (Active, On Leave) and Patient Condition (Critical, Stable, etc.)
 */
export default function Badge({
  children,
  variant = 'neutral',
  dot = false,
  pulse = false,
  className = '',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border select-none transition-colors';

  const variants = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const dotColors = {
    success: 'bg-emerald-500',
    danger: 'bg-rose-500',
    warning: 'bg-amber-500',
    info: 'bg-indigo-500',
    teal: 'bg-teal-500',
    neutral: 'bg-slate-400',
  };

  return (
    <span className={cn(baseStyles, variants[variant] || variants.neutral, className)} {...props}>
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            dotColors[variant] || 'bg-slate-400',
            pulse && 'animate-pulse'
          )}
        />
      )}
      {children}
    </span>
  );
}
