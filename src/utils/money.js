export const toCents = (shillings) => Math.round(Number(shillings) * 100);

export const formatKES = (cents) =>
  'KES ' + (cents / 100).toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });