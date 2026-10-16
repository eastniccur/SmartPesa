// "2026-10" style month used by budgets, transactions and the dashboard
export const currentMonth = () => new Date().toISOString().slice(0, 7);