import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Reusable Select Dropdown Component
 * Supports array of string/object options or custom children option tags
 */
export default function Select({
  label = '',
  error = '',
  helperText = '',
  options = [],
  className = '',
  id,
  children,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700">
          {label}
        </label>
      )}

      <select
        id={selectId}
        className={cn(
          'w-full bg-slate-50 text-xs text-slate-900 rounded-lg border border-slate-200 py-2.5 px-3 transition duration-150',
          'focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-rose-300 focus:border-rose-500 focus:ring-rose-500',
          className
        )}
        {...props}
      >
        {options.length > 0
          ? options.map((opt, idx) => {
              const value = typeof opt === 'object' ? opt.value : opt;
              const text = typeof opt === 'object' ? opt.label : opt;
              return (
                <option key={idx} value={value}>
                  {text}
                </option>
              );
            })
          : children}
      </select>

      {error ? (
        <p className="text-[11px] text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}
