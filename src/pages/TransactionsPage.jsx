member4/theme-forms
import { useEffect, useState } from "react";
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../services/api";
import "../styles/theme.css";

const initialForm = {
  category: "",
  amount: "",
  month: new Date().toISOString().slice(0, 7),
};

function getItems(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.budgets)) return data.budgets;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function formatKes(cents) {
  return (Number(cents || 0) / 100).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function BudgetPage() {
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadBudgets() {
    setLoading(true);
    setError("");

    try {
      const data = await getBudgets();
      setBudgets(getItems(data));
    } catch (err) {
      setError(err.message || "Unable to load budgets.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBudgets();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function resetForm() {
    setForm({ ...initialForm });
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const amount = Number(form.amount);

    if (
      !form.category.trim() ||
      !form.month ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setError("Enter a category, valid amount, and month.");
      return;
    }

    // Send the exact field names expected by the backend.
    const payload = {
      category: form.category.trim(),
      limit_cents: Math.round(amount * 100),
      month: form.month,
    };

    setSaving(true);

    try {
      if (editingId !== null) {
        await updateBudget(editingId, payload);
        setMessage("Budget updated successfully.");
      } else {
        await createBudget(payload);
        setMessage("Budget created successfully.");
      }

      resetForm();
      await loadBudgets();
    } catch (err) {
      setError(err.message || "Unable to save budget.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(budget) {
    setEditingId(budget.id);
    setForm({
      category: budget.category || "",
      amount:
        budget.limit_cents != null
          ? String(Number(budget.limit_cents) / 100)
          : "",
      month: budget.month || initialForm.month,
    });
    setError("");
    setMessage("");
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this budget?")) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await deleteBudget(id);
      setBudgets((previous) =>
        previous.filter((budget) => budget.id !== id)
      );

      if (editingId === id) resetForm();

      setMessage("Budget deleted successfully.");
    } catch (err) {
      setError(err.message || "Unable to delete budget.");
    }
  }

  return (
    <main className="page-container">
      <header className="page-header">
        <h1>My Budgets</h1>
        <p>Set and manage your monthly spending limits.</p>
      </header>

      <section className="form-card">
        <h2>{editingId !== null ? "Edit Budget" : "Create Budget"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Food"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Budget limit (KES)</label>
            <input
              id="amount"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={handleChange}
              placeholder="e.g. 1500"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="month">Month</label>
            <input
              id="month"
              name="month"
              type="month"
              value={form.month}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId !== null
                  ? "Update Budget"
                  : "Add Budget"}
            </button>

            {editingId !== null && (
              <button type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {error && <p role="alert" className="error-message">{error}</p>}
      {message && <p role="status" className="success-message">{message}</p>}

      <section className="budget-list">
        <h2>Budget List</h2>

        {loading ? (
          <p>Loading budgets...</p>
        ) : budgets.length === 0 ? (
          <p>No budgets yet. Create your first budget above.</p>
        ) : (
          budgets.map((budget) => (
            <article className="budget-card" key={budget.id}>
              <div>
                <h3>{budget.category}</h3>
                <p>Month: {budget.month}</p>
                <p>Limit: KES {formatKes(budget.limit_cents)}</p>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => handleEdit(budget)}>
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(budget.id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
import { useRef, useState } from 'react';
import { filterTransactions, mergeTransactions, mockSyncTransactions, validateTransaction } from '../lib/transactions';
import './TransactionsPage.css';

const money = (amount) => `KES ${Number(amount).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const emptyForm = { title: '', amount: '', type: 'Paybill', category: '' };

export function TransactionsPage({ transactions, setTransactions, categories = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [syncing, setSyncing] = useState(false);
  const syncLock = useRef(false);
  const filterCategories = [...new Set([...categories, ...transactions.map((tx) => tx.category)])];
  const filtered = filterTransactions(transactions, searchQuery, selectedCategory);
  const total = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
  const visibleTotal = filtered.reduce((sum, tx) => sum + Number(tx.amount), 0);

  function updateForm(event) {
    setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));
    setError('');
  }

  function addTransaction(event) {
    event.preventDefault();
    const validation = validateTransaction(form, categories);
    if (validation) { setError(validation); return; }
    const now = new Date();
    const id = crypto.randomUUID();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const transaction = { ...form, title: form.title.trim(), amount: Number(form.amount), id,
      receiptNo: `MANUAL-${id}`, date, time: now.toTimeString().slice(0, 5) };
    setTransactions((previous) => [transaction, ...previous]);
    setForm(emptyForm);
    setSearchQuery('');
    setSelectedCategory('');
    setError('');
    setMessage('Transaction added. Shared spending totals have updated.');
  }

  async function syncStatement() {
    if (syncLock.current) return;
    syncLock.current = true;
    setSyncing(true);
    setMessage('');
    try {
      await new Promise((resolve) => setTimeout(resolve, 450));
      setTransactions((previous) => mergeTransactions(previous, mockSyncTransactions));
      setMessage('Demo sync complete. Sample records are available; existing receipts were not duplicated.');
    } catch {
      setMessage('Sync failed. Please try again.');
    } finally {
      syncLock.current = false;
      setSyncing(false);
    }
  }

  return <section className="transactions-page">
    <header className="transactions-heading"><div><p className="transactions-eyebrow">YOUR SPENDING HISTORY</p><h1>Transactions</h1><p>Find a payment, record an expense, and keep your totals up to date.</p></div>
      <button className="button-primary" onClick={syncStatement} disabled={syncing}>{syncing ? 'Syncing demo…' : 'Sync M-Pesa Statement'}</button>
    </header>
    <p className="transactions-demo">Demo sync imports two sample payments. It does not connect to your M-Pesa account.</p>
    <p className="transactions-status" role="status">{message}</p>
    <div className="transactions-summary"><div><span>Transactions</span><strong>{transactions.length}</strong></div><div><span>Total spending</span><strong>{money(total)}</strong></div><div><span>Matching spending</span><strong>{money(visibleTotal)}</strong></div></div>
    <section className="transactions-panel" aria-labelledby="add-transaction-title"><h2 id="add-transaction-title">Add a transaction</h2>
      <form onSubmit={addTransaction} noValidate>
        <div className="transactions-form">
          <label>Title<input name="title" value={form.title} onChange={updateForm} placeholder="e.g. Naivas groceries" maxLength={120} required /></label>
          <label>Amount (KES)<input name="amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={updateForm} placeholder="0.00" required /></label>
          <label>Type<select name="type" value={form.type} onChange={updateForm}><option>Paybill</option><option value="Till Number">Till</option><option>Send Money</option><option>Airtime</option></select></label>
          <label>Category<select name="category" value={form.category} onChange={updateForm} required><option value="">Choose category</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
        </div>
        {categories.length === 0 && <p>Add a category in Settings before recording a payment.</p>}
        {error && <p className="transactions-error" role="alert">{error}</p>}
        <button className="button-primary" type="submit" disabled={categories.length === 0}>Add transaction</button>
      </form>
    </section>
    <section className="transactions-panel" aria-labelledby="history-title"><h2 id="history-title">Payment history</h2>
      <div className="transactions-filters"><label>Search transactions<input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search title, receipt or category" /></label>
        <label>Filter by category<select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}><option value="">All categories</option>{filterCategories.map((category) => <option key={category}>{category}</option>)}</select></label>
        <button className="transactions-clear" onClick={() => { setSearchQuery(''); setSelectedCategory(''); }}>Clear filters</button>
      </div>
      <p className="transactions-count" aria-live="polite">Showing {filtered.length} of {transactions.length} transactions</p>
      {filtered.length === 0 ? <p className="transactions-empty">{transactions.length === 0 ? 'No transactions yet. Add your first expense above.' : 'No matching transactions. Try another search or clear the filters.'}</p> :
        <div className="transactions-table-scroll" tabIndex={0} role="region" aria-label="Transaction table"><table><caption className="transactions-sr-only">Transactions matching your search and category filter</caption><thead><tr><th scope="col">Transaction</th><th scope="col">Receipt</th><th scope="col">Category</th><th scope="col">Type</th><th scope="col">Date</th><th scope="col">Amount</th></tr></thead><tbody>
          {filtered.map((tx) => <tr key={tx.id}><td>{tx.title}</td><td className="transactions-receipt">{tx.receiptNo}</td><td>{tx.category}</td><td>{tx.type}</td><td>{tx.date}<span className="transactions-time">{tx.time}</span></td><td className="transactions-amount">{money(tx.amount)}</td></tr>)}
        </tbody></table></div>}
    </section>
  </section>;
main
}