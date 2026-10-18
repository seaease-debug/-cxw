/**
 * Format currency to CNY (¥) with proper formatting (e.g., ¥1,234)
 */
export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    maximumFractionDigits: 0
  }).format(val);
};

/**
 * Format price as simple locale string with ¥ prefix
 */
export const formatPrice = (val: number): string => {
  return `¥${(val || 0).toLocaleString()}`;
};

/**
 * Format a date string or Date object to YYYY-MM-DD
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return typeof date === 'string' ? date : '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
