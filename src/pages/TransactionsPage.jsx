<<<<<<< HEAD
member4/theme-forms
import { useEffect, useState } from "react";
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../services/api";
import "../styles/theme.css";
=======
import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import { formatKES, toCents } from '../utils/money';
import { useToast } from '../components/Toast';
import { Loading } from '../components/Loading';
import { MpesaModal } from '../components/MpesaModal';
import {  currentMonth } from '../config';
import './TransactionsPage.css';
import { useAuth } from '../context/AuthContext';
>>>>>>> fbdf4b6 (complete frontend intergration)

const TYPE_LABELS = {
  paybill: 'Paybill',
  till: 'Till Number',
  send_money: 'Send Money',
  airtime: 'Airtime',
  withdrawal: 'Withdrawal',
  other: 'Other',
};
const MAX_AMOUNT_KES = 1000000;
const emptyForm = { description: '', amount: '', transaction_type: 'paybill', budget_id: '' };

export function TransactionsPage() {
  const { user } = useAuth();
  const userId = user.id;
  const showToast = useToast();
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [payOpen, setPayOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const [txData, budgetData] = await Promise.all([
        api(`/api/transactions?user_id=${userId}`),
        api(`/api/budgets?user_id=${userId}`),
      ]);
      setTransactions(txData.transactions);
      setBudgets(budgetData.budgets);
      setLoadError('');
    } catch (err) {
      setLoadError(err.message);
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  }, [showToast, userId]);

  useEffect(() => {
    load();
  }, [load]);

  // Transactions only carry budget_id, so category names come from the budgets
  const budgetsById = Object.fromEntries(budgets.map((b) => [b.id, b]));
  const categoryOf = (tx) => budgetsById[tx.budget_id]?.category || 'Uncategorized';
  const currentBudgets = budgets.filter((b) => b.month === currentMonth());

  const filterCategories = [...new Set(transactions.map(categoryOf))].sort();
  const query = searchQuery.trim().toLowerCase();
  const filtered = transactions.filter((tx) => {
    if (selectedCategory && categoryOf(tx) !== selectedCategory) return false;
    if (!query) return true;
    return [tx.description, tx.mpesa_code, categoryOf(tx)]
      .some((field) => String(field ?? '').toLowerCase().includes(query));
  });

  const total = transactions.reduce((sum, tx) => sum + tx.amount_cents, 0);
  const visibleTotal = filtered.reduce((sum, tx) => sum + tx.amount_cents, 0);

  function updateForm(event) {
    setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));
    setError('');
  }

  async function addTransaction(event) {
    event.preventDefault();
    const description = form.description.trim();
    const amount = Number(form.amount);

    if (!description) return setError('Enter a title for the transaction.');
    if (!form.amount || Number.isNaN(amount) || amount <= 0) {
      return setError('Enter an amount greater than 0.');
    }
    if (amount > MAX_AMOUNT_KES) {
      return setError('The amount cannot exceed KES 1,000,000.');
    }

    setSaving(true);
    try {
      await api('/api/transactions', {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId,
          budget_id: form.budget_id ? Number(form.budget_id) : null,
          description,
          amount_cents: toCents(amount),
          transaction_type: form.transaction_type,
        }),
      });
      setForm(emptyForm);
      setSearchQuery('');
      setSelectedCategory('');
      setError('');
      showToast('Transaction added', 'success');
      await load();
    } catch (err) {
      setError(err.message);
      showToast(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeTransaction(tx) {
    if (!window.confirm(`Delete "${tx.description}"?`)) return;
    setDeletingId(tx.id);
    try {
      await api(`/api/transactions/${tx.id}`, { method: 'DELETE' });
      showToast('Transaction deleted', 'success');
      await load();
    } catch (err) {
      showToast(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <Loading text="Loading your transactions..." />;
  if (loadError && transactions.length === 0 && budgets.length === 0) {
    return <p style={{ color: 'var(--danger)' }}>Could not load transactions: {loadError}</p>;
  }

  return (
    <section className="transactions-page">
      <header className="transactions-heading">
        <div>
          <p className="transactions-eyebrow">YOUR SPENDING HISTORY</p>
          <h1>Transactions</h1>
          <p>Find a payment, record an expense, and keep your totals up to date.</p>
        </div>
        <button className="button-primary" onClick={() => setPayOpen(true)}>
          Pay with M-Pesa
        </button>
      </header>
      <p className="transactions-demo">
        M-Pesa payments run through the Safaricom Daraja sandbox, so no real money moves.
      </p>

      <div className="transactions-summary">
        <div><span>Transactions</span><strong>{transactions.length}</strong></div>
        <div><span>Total spending</span><strong>{formatKES(total)}</strong></div>
        <div><span>Matching spending</span><strong>{formatKES(visibleTotal)}</strong></div>
      </div>

      <section className="transactions-panel" aria-labelledby="add-transaction-title">
        <h2 id="add-transaction-title">Add a transaction</h2>
        <form onSubmit={addTransaction} noValidate>
          <div className="transactions-form">
            <label>Title
              <input name="description" value={form.description} onChange={updateForm}
                placeholder="e.g. Naivas groceries" maxLength={200} required />
            </label>
            <label>Amount (KES)
              <input name="amount" type="number" min="0.01" step="0.01" value={form.amount}
                onChange={updateForm} placeholder="0.00" required />
            </label>
            <label>Type
              <select name="transaction_type" value={form.transaction_type} onChange={updateForm}>
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <label>Budget category
              <select name="budget_id" value={form.budget_id} onChange={updateForm}>
                <option value="">No budget (uncategorized)</option>
                {currentBudgets.map((b) => (
                  <option key={b.id} value={b.id}>{b.category}</option>
                ))}
              </select>
            </label>
          </div>
          {currentBudgets.length === 0 && (
            <p>No budgets for {currentMonth()} yet. Add one on the Budget page to categorize payments.</p>
          )}
          {error && <p className="transactions-error" role="alert">{error}</p>}
          <button className="button-primary" type="submit" disabled={saving}>
            {saving ? 'Adding...' : 'Add transaction'}
          </button>
        </form>
      </section>

      <section className="transactions-panel" aria-labelledby="history-title">
        <h2 id="history-title">Payment history</h2>
        <div className="transactions-filters">
          <label>Search transactions
            <input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search title, receipt or category" />
          </label>
          <label>Filter by category
            <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
              <option value="">All categories</option>
              {filterCategories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
          <button className="transactions-clear" type="button"
            onClick={() => { setSearchQuery(''); setSelectedCategory(''); }}>
            Clear filters
          </button>
        </div>
        <p className="transactions-count" aria-live="polite">
          Showing {filtered.length} of {transactions.length} transactions
        </p>
        {filtered.length === 0 ? (
          <p className="transactions-empty">
            {transactions.length === 0
              ? 'No transactions yet. Add your first expense above.'
              : 'No matching transactions. Try another search or clear the filters.'}
          </p>
        ) : (
          <div className="transactions-table-scroll" tabIndex={0} role="region" aria-label="Transaction table">
            <table>
              <caption className="transactions-sr-only">
                Transactions matching your search and category filter
              </caption>
              <thead>
                <tr>
                  <th scope="col">Transaction</th>
                  <th scope="col">Receipt</th>
                  <th scope="col">Category</th>
                  <th scope="col">Type</th>
                  <th scope="col">Date</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => {
                  const when = new Date(tx.occurred_at);
                  return (
                    <tr key={tx.id}>
                      <td>{tx.description}</td>
                      <td className="transactions-receipt">{tx.mpesa_code || 'Manual'}</td>
                      <td>{categoryOf(tx)}</td>
                      <td>{TYPE_LABELS[tx.transaction_type] || tx.transaction_type}</td>
                      <td>
                        {when.toLocaleDateString('en-CA')}
                        <span className="transactions-time">
                          {when.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="transactions-amount">{formatKES(tx.amount_cents)}</td>
                      <td>
                        <button className="button-text-danger" type="button"
                          onClick={() => removeTransaction(tx)} disabled={deletingId === tx.id}
                          aria-label={`Delete ${tx.description}`}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <MpesaModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        budgets={currentBudgets}
        onCompleted={() => {
          showToast('M-Pesa payment recorded', 'success');
          load();
        }}
      />
    </section>
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