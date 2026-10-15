export function filterTransactions(transactions, query, category) {
  const needle = query.trim().toLowerCase();
  return transactions.filter((tx) => (!category || tx.category === category) &&
    [tx.receiptNo, tx.title, tx.category].some((value) => String(value ?? '').toLowerCase().includes(needle)));
}

export function validateTransaction({ title, amount, type, category }, categories) {
  if (!title.trim()) return 'Enter a transaction title.';
  if (!/^\d+(\.\d{1,2})?$/.test(String(amount).trim()) || Number(amount) <= 0 || Number(amount) > Number.MAX_SAFE_INTEGER / 100) return 'Enter a positive KES amount with up to two decimal places.';
  if (!['Paybill', 'Till Number', 'Send Money', 'Airtime'].includes(type)) return 'Choose a transaction type.';
  if (!categories.includes(category)) return 'Choose an available category.';
  return '';
}

export function mergeTransactions(existing, incoming) {
  const ids = new Set(existing.map((tx) => tx.id));
  const receipts = new Set(existing.map((tx) => tx.receiptNo).filter(Boolean));
  const additions = incoming.filter((tx) => {
    if (ids.has(tx.id) || (tx.receiptNo && receipts.has(tx.receiptNo))) return false;
    ids.add(tx.id);
    if (tx.receiptNo) receipts.add(tx.receiptNo);
    return true;
  });
  return [...additions, ...existing];
}

// Deliberately simulated data, not a live Daraja statement integration.
export const mockSyncTransactions = [
  { id: 'DEMO-SYNC-1', receiptNo: 'DEMO000001', title: 'Sample supermarket purchase', amount: 1250, type: 'Till Number', category: 'Food & Groceries', date: '2026-10-02', time: '10:30' },
  { id: 'DEMO-SYNC-2', receiptNo: 'DEMO000002', title: 'Sample electricity tokens', amount: 750, type: 'Paybill', category: 'Utilities', date: '2026-10-02', time: '09:10' },
];
