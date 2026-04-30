import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx for conditional class names.
 * Handles conflicts between Tailwind utility classes automatically.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency value in Indian notation.
 * @param value - Value in crores
 * @returns Formatted string like "₹4.2 Cr" or "₹85 Lakh"
 */
export function formatCurrency(value: number): string {
  if (value >= 1) {
    return `₹${value.toFixed(1)} Cr`;
  }
  const lakhs = value * 100;
  return `₹${lakhs.toFixed(0)} Lakh`;
}

/**
 * Format a date relative to now (e.g., "3 days ago", "2 hours ago").
 */
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins <= 1 ? 'Just now' : `${diffMins} mins ago`;
    }
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  }

  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Calculate days remaining until a target date.
 */
export function daysUntil(targetDate: string): number {
  const target = new Date(targetDate);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Get urgency level based on days remaining.
 */
export function getUrgencyLevel(days: number): 'normal' | 'warning' | 'critical' {
  if (days <= 2) return 'critical';
  if (days <= 7) return 'warning';
  return 'normal';
}

/**
 * Truncate text to a maximum length with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Detect if text contains Hindi characters.
 */
export function containsHindi(text: string): boolean {
  return /[\u0900-\u097F]/.test(text);
}

/**
 * Generate a unique ID.
 */
export function generateId(): string {
  return crypto.randomUUID();
}
