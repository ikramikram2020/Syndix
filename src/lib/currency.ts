export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatCurrencyShort = (amount: number): string => {
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1) + 'M DA';
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(0) + 'K DA';
  }
  return amount.toLocaleString() + ' DA';
};