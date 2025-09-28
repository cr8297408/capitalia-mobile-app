/**
 * Utility functions for currency formatting
 */

/**
 * Formats a numeric string with thousands separators and limits decimal places
 * @param value - The string value to format
 * @returns Formatted string with commas as thousands separators
 */
export const formatCurrency = (value: string): string => {
  // Remove all non-numeric characters except dots
  const numericValue = value.replace(/[^0-9.]/g, '');
  
  // Handle empty string
  if (!numericValue) return '';
  
  // Split by decimal point
  const parts = numericValue.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];
  
  // Add thousands separators to integer part
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Return with decimal part if it exists
  if (decimalPart !== undefined) {
    return `${formattedInteger}.${decimalPart.slice(0, 2)}`; // Limit to 2 decimal places
  }
  
  return formattedInteger;
};

/**
 * Removes currency formatting (commas) to get clean numeric value
 * @param value - The formatted currency string
 * @returns Clean numeric string without commas
 */
export const parseCurrencyToNumber = (value: string): string => {
  return value.replace(/,/g, '');
};

/**
 * Formats a number to currency display with $ symbol
 * @param amount - The numeric amount
 * @returns Formatted currency string with $ symbol and thousands separators
 */
export const formatCurrencyDisplay = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Parses a currency input string to a number
 * @param value - The currency string (can contain commas, $, etc.)
 * @returns Numeric value
 */
export const parseCurrencyToFloat = (value: string): number => {
  const cleanValue = value.replace(/[^0-9.]/g, '');
  return parseFloat(cleanValue) || 0;
};