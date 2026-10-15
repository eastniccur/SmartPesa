export function formatKES(cents) {
  const amount = Number(cents) / 100;
  return `KES ${amount.toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function toCents(shillings) {
  return Math.round(Number(shillings) * 100);
}
