import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Universal Tailwind class merger
 * Combines dynamic conditionals and resolves conflicting Tailwind utility classes
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
