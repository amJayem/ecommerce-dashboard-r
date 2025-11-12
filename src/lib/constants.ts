/**
 * Currency configuration
 * Centralized currency settings for the application
 */
export const CURRENCY = {
  code: "BDT",
  symbol: "৳",
  name: "Bangladeshi Taka",
} as const

/**
 * Format a number as currency with proper localization and symbol
 * 
 * This function converts a numeric value (number or string) into a formatted
 * currency string using the centralized currency configuration. It handles:
 * - Number formatting with thousand separators (commas)
 * - Decimal precision control
 * - Currency symbol prefixing
 * 
 * @param amount - The amount to format. Can be a number or string representation of a number
 * @param options - Optional formatting configuration
 * @param options.showSymbol - Whether to include the currency symbol (default: true)
 * @param options.decimals - Number of decimal places to display (default: 2)
 * @returns Formatted currency string (e.g., "৳1,234.56" or "1,234.56" if showSymbol is false)
 * 
 * @example
 * formatCurrency(1234.56) // Returns "৳1,234.56"
 * formatCurrency("1234.56", { decimals: 0 }) // Returns "৳1,235"
 * formatCurrency(1234.56, { showSymbol: false }) // Returns "1,234.56"
 */
export function formatCurrency(
  amount: number | string,
  options?: {
    showSymbol?: boolean
    decimals?: number
  }
): string {
  // Extract options with defaults: show symbol by default, 2 decimal places
  const { showSymbol = true, decimals = 2 } = options || {}
  
  // Convert string to number if needed (handles both "123.45" and 123.45)
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount
  
  // Format the number with locale-specific formatting (en-US adds commas for thousands)
  // This ensures numbers like 1234.56 become "1,234.56"
  const formatted = numAmount.toLocaleString("en-US", {
    minimumFractionDigits: decimals, // Always show at least this many decimals
    maximumFractionDigits: decimals,  // Never show more than this many decimals
  })
  
  // Prepend currency symbol if requested, otherwise return just the formatted number
  return showSymbol ? `${CURRENCY.symbol}${formatted}` : formatted
}

