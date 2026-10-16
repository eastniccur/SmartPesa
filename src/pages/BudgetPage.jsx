import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import { formatKES, toCents } from '../utils/money';
import { useToast } from '../components/Toast';
import { Loading } from '../components/Loading';
import {  currentMonth } from '../config';
import { useAuth } from '../context/AuthContext';

const SUGGESTED_CATEGORIES = ['Food', 'Shopping', 'Utilities', 'Entertainment', 'Transport', 'Airtime'];

const getStatus = (percentage, limitCents) => {
  if (limitCents <= 0) return { label: 'Set a limit', className: 'untracked' };
  if (percentage >= 100) return { label: 'Limit reached', className: 'exceeded' };
  if (percentage >= 80) return { label: 'Near limit', className: 'warning' };
  return { label: 'On track', className: 'safe' };
};

export function BudgetPage() {
  const { user } = useAuth();
  const userId = user.id;
  const showToast = useToast();
  const month = currentMonth();

  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [drafts, setDrafts] = useState({});      // unsaved limit edits, keyed by budget id (shillings, as typed)
  const [busyId, setBusyId] = useState(null);    // budget being saved or deleted
  const [newCategory, setNewCategory] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api(`/api/budgets?user_id=${userId}&month=${month}`);
      setBudgets(data.budgets);
      setError('');
    } catch (err) {
      setError(err.message);
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  }, [month, showToast, userId]);

  useEffect(() => {
    load();
  }, [load]);

  async function addBudget(event) {
    event.preventDefault();
    const category = newCategory.trim();
    const shillings = Number(newLimit);
    if (!category) return showToast('Enter a category name');
    if (newLimit === '' || Number.isNaN(shillings) || shillings < 0) {
      return showToast('Enter a valid limit of 0 or more');
    }

    setAdding(true);
    try {
      await api('/api/budgets', {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId,
          category,
          limit_cents: toCents(shillings),
          month,
        }),
      });
      setNewCategory('');
      setNewLimit('');
      showToast(`${category} budget created`, 'success');
      await load();
    } catch (err) {
      showToast(err.message); // 409 when the category already exists this month
    } finally {
      setAdding(false);
    }
  }

  async function saveLimit(budget) {
    const draft = drafts[budget.id];
    const shillings = Number(draft);
    if (draft === '' || Number.isNaN(shillings) || shillings < 0) {
      return showToast('Enter a valid limit of 0 or more');
    }

    setBusyId(budget.id);
    try {
      await api(`/api/budgets/${budget.id}`, {
        method: 'PUT',
        body: JSON.stringify({ limit_cents: toCents(shillings) }),
      });
      setDrafts((current) => {
        const next = { ...current };
        delete next[budget.id];
        return next;
      });
      showToast(`${budget.category} limit updated`, 'success');
      await load();
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function removeBudget(budget) {
    const confirmed = window.confirm(
      `Delete the ${budget.category} budget? Its transactions will be kept as uncategorized.`
    );
    if (!confirmed) return;

    setBusyId(budget.id);
    try {
      await api(`/api/budgets/${budget.id}`, { method: 'DELETE' });
      showToast(`${budget.category} budget deleted`, 'success');
      await load();
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <Loading text="Loading your budgets..." />;
  if (error && budgets.length === 0) {
    return <p style={{ color: 'var(--danger)' }}>Could not load budgets: {error}</p>;
  }

  const totalLimit = budgets.reduce((sum, b) => sum + b.limit_cents, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent_cents, 0);
  const remaining = totalLimit - totalSpent;
  const overallPercentage = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;
  const trackedCategories = budgets.filter((b) => b.limit_cents > 0).length;

  return (
    <div className="budget-page">
      <header className="budget-page-header">
        <div>
          <p className="budget-eyebrow">
            SMARTPESA <span>/</span> FINANCIAL PLANNER
          </p>
          <h1>Your budgets, at a glance</h1>
          <p className="budget-description">
            Set monthly limits, keep an eye on your spending, and stay in control. Showing {month}.
          </p>
        </div>
        <div className="budget-header-icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </header>

      <section className="budget-overview" aria-label="Budget overview">
        <article className="budget-overview-card budget-overview-primary">
          <div className="budget-overview-icon" aria-hidden="true">↗</div>
          <div>
            <p className="budget-overview-label">Total monthly budget</p>
            <strong>{formatKES(totalLimit)}</strong>
            <span>{trackedCategories} of {budgets.length} categories set</span>
          </div>
        </article>
        <article className="budget-overview-card">
          <div className="budget-overview-icon spent" aria-hidden="true">−</div>
          <div>
            <p className="budget-overview-label">Spent so far</p>
            <strong>{formatKES(totalSpent)}</strong>
            <span>{Math.round(overallPercentage)}% of your total limit</span>
          </div>
        </article>
        <article className="budget-overview-card">
          <div
            className={`budget-overview-icon ${remaining < 0 ? 'over' : 'remaining'}`}
            aria-hidden="true"
          >
            {remaining < 0 ? '!' : '✓'}
          </div>
          <div>
            <p className="budget-overview-label">{remaining < 0 ? 'Over budget' : 'Left to spend'}</p>
            <strong className={remaining < 0 ? 'budget-total-over' : ''}>
              {formatKES(Math.abs(remaining))}
            </strong>
            <span>Across all categories</span>
          </div>
        </article>
      </section>

      <section className="budget-categories-section" aria-labelledby="budget-add-title">
        <div className="budget-section-heading">
          <div>
            <p className="budget-section-kicker">NEW BUDGET</p>
            <h2 id="budget-add-title">Add a category budget</h2>
          </div>
        </div>
        <form
          onSubmit={addBudget}
          style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}
        >
          <label className="budget-input-label">
            <span>Category</span>
            <input
              className="budget-limit-input"
              list="budget-category-suggestions"
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
              placeholder="e.g. Food"
              maxLength={50}
              required
            />
            <datalist id="budget-category-suggestions">
              {SUGGESTED_CATEGORIES.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </label>
          <label className="budget-input-label">
            <span>Monthly limit (KES)</span>
            <input
              className="budget-limit-input"
              type="number"
              min="0"
              step="100"
              value={newLimit}
              onChange={(event) => setNewLimit(event.target.value)}
              placeholder="5000"
              required
            />
          </label>
          <button className="button-primary" type="submit" disabled={adding}>
            {adding ? 'Adding...' : 'Add budget'}
          </button>
        </form>
      </section>

      <section className="budget-categories-section" aria-labelledby="budget-categories-title">
        <div className="budget-section-heading">
          <div>
            <p className="budget-section-kicker">MONTHLY PLAN</p>
            <h2 id="budget-categories-title">Category budgets</h2>
            <p>Edit a limit, then press Save to apply it.</p>
          </div>
          <span className="budget-category-count">
            {budgets.length} {budgets.length === 1 ? 'category' : 'categories'}
          </span>
        </div>

        {budgets.length > 0 ? (
          <div className="budget-grid">
            {budgets.map((budget) => {
              const percentage = budget.limit_cents > 0 ? (budget.spent_cents / budget.limit_cents) * 100 : 0;
              const barWidth = Math.min(percentage, 100);
              const status = getStatus(percentage, budget.limit_cents);
              const draft = drafts[budget.id];
              const inputValue = draft ?? String(budget.limit_cents / 100);
              const dirty = draft !== undefined && toCents(draft) !== budget.limit_cents;
              const busy = busyId === budget.id;

              return (
                <article className="budget-card" key={budget.id}>
                  <div className="budget-card-heading">
                    <div className="budget-category-icon" aria-hidden="true">
                      {budget.category.slice(0, 1).toUpperCase()}
                    </div>
                    <span className={`status-badge ${status.className}`}>
                      <span className="status-indicator" aria-hidden="true" />
                      {status.label}
                    </span>
                  </div>

                  <h2 className="budget-category-title">{budget.category}</h2>

                  <div className="budget-amounts">
                    <div>
                      <span className="budget-label">Spent so far</span>
                      <strong className="budget-spent">{formatKES(budget.spent_cents)}</strong>
                    </div>
                    <div>
                      <span className="budget-label">Budget limit</span>
                      <strong className="budget-limit-value">{formatKES(budget.limit_cents)}</strong>
                    </div>
                  </div>

                  <div className="budget-progress-heading">
                    <span>Monthly progress</span>
                    <strong className={percentage >= 100 ? 'budget-percent-over' : ''}>
                      {Math.round(percentage)}%
                    </strong>
                  </div>

                  <div
                    className="progress-container"
                    role="progressbar"
                    aria-label={`${budget.category} budget used`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(barWidth)}
                  >
                    <div className={`progress-bar ${status.className}`} style={{ width: `${barWidth}%` }} />
                  </div>

                  <div className="budget-card-footer">
                    <p className="budget-remaining">
                      {budget.limit_cents > 0
                        ? budget.remaining_cents < 0
                          ? `${formatKES(-budget.remaining_cents)} over budget`
                          : `${formatKES(budget.remaining_cents)} remaining`
                        : 'Add a limit to start tracking'}
                    </p>

                    <label className="budget-input-label">
                      <span>Monthly limit</span>
                      <span className="budget-input-wrap">
                        <span aria-hidden="true">KES</span>
                        <input
                          className="budget-limit-input"
                          type="number"
                          min="0"
                          step="100"
                          value={inputValue}
                          onChange={(event) =>
                            setDrafts({ ...drafts, [budget.id]: event.target.value })
                          }
                          aria-label={`Budget limit for ${budget.category}`}
                        />
                      </span>
                    </label>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button
                        className="button-primary"
                        type="button"
                        onClick={() => saveLimit(budget)}
                        disabled={!dirty || busy}
                      >
                        {busy ? 'Working...' : 'Save'}
                      </button>
                      <button
                        className="button-text-danger"
                        type="button"
                        onClick={() => removeBudget(budget)}
                        disabled={busy}
                        aria-label={`Delete ${budget.category} budget`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="budget-empty-state">
            <div className="budget-empty-icon" aria-hidden="true">+</div>
            <h3>No budgets for {month} yet</h3>
            <p>Use the form above to add your first category budget.</p>
          </div>
        )}
      </section>
    </div>
  );
}