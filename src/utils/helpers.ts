export const formatCurrency = (value: number, currency = 'PKR') =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

export const formatQuantity = (value: number, unit: string) => `${value} ${unit}`;
