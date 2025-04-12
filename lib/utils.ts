import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number into a compact string (e.g., 1.2k, 3M) or currency.
 * @param num The number to format.
 * @param formatType 'compact' for short notation, 'usd' for currency.
 * @param maximumFractionDigits Max decimal places for currency.
 * @returns Formatted string.
 */
export function formatNumber(
  num: number | null | undefined,
  formatType: 'compact' | 'usd' = 'compact',
  maximumFractionDigits: number = 2
): string {
  if (num === null || num === undefined) {
    return '-'; // Or 'N/A', or '0' depending on preference
  }

  try {
    if (formatType === 'compact') {
      return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1, // Typically 1 for compact
      }).format(num);
    } else if (formatType === 'usd') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: maximumFractionDigits,
        minimumFractionDigits: 2 // Usually show cents for USD
      }).format(num);
    } else {
      // Default or fallback formatting
      return num.toLocaleString('en-US');
    }
  } catch (error) {
    console.error("Error formatting number:", error);
    return num.toString(); // Fallback to simple string conversion
  }
}
