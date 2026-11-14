import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Reusable Form & Search Input Component
 * Follows Rule 5 (Explicit props), Rule 9 (Accessible label & semantic input)
 */
export default function Input({
  label = '',
  error = '',
  helperText = '',
  icon = null,
  rightIcon = null,
  className = '',
  id,
  type = 'text',
  disabled = false,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center">
            {icon}
          </div>
        )}

        <input
          id={inputId}
          type={type}
          disabled={disabled}
          className={cn(
            'w-full bg-slate-50 text-xs text-slate-900 rounded-lg border border-slate-200 py-2.5 transition duration-150',
            'focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500',
            'placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed',
            icon ? 'pl-9' : 'pl-3.5',
            rightIcon ? 'pr-9' : 'pr-3.5',
            error && 'border-rose-300 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/20',
            className
          )}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3 text-slate-400 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-[11px] text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}
