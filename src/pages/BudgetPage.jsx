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
}

import React from 'react';

const DEFAULT_CATEGORIES = [
  'Food',
  'Shopping',
  'Utilities',
  'Entertainment',
  'Transport',
];

const findBudget = (budgets, category) => {
  const normalizedCategory = category.toLowerCase();

  if (Array.isArray(budgets)) {
    return budgets.find(
      (budget) => budget.category?.toLowerCase() === normalizedCategory
    );
  }

  if (budgets && typeof budgets === 'object') {
    const key = Object.keys(budgets).find(
      (budgetCategory) => budgetCategory.toLowerCase() === normalizedCategory
    );

    if (key !== undefined) {
      return { category: key, limit: budgets[key] };
    }
  }

  return undefined;
};

export const BudgetPage = ({
  budgets = [],
  setBudgets,
  transactions = [],
  categories = [],
}) => {
  // Fallback to default categories if categories prop is empty
  const activeCategories =
    categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  const getSpentAmount = (category) => {
    return transactions
      .filter(
        (tx) =>
          String(tx.category ?? '').toLowerCase() === category.toLowerCase() &&
          (tx.type === 'expense' || tx.amount < 0)
      )
      .reduce((sum, tx) => sum + Math.abs(Number(tx.amount || 0)), 0);
  };

  const updateBudget = (category, newLimit) => {
    const limit = Math.max(0, Number(newLimit) || 0);

    setBudgets((previousBudgets) => {
      if (!Array.isArray(previousBudgets)) {
        const budgetMap =
          previousBudgets && typeof previousBudgets === 'object'
            ? previousBudgets
            : {};
        const existingCategory = Object.keys(budgetMap).find(
          (budgetCategory) =>
            budgetCategory.toLowerCase() === category.toLowerCase()
        );

        return {
          ...budgetMap,
          [existingCategory ?? category]: limit,
        };
      }

      const existingBudget = findBudget(previousBudgets, category);

      if (existingBudget) {
        return previousBudgets.map((budget) =>
          budget.category?.toLowerCase() === category.toLowerCase()
            ? { ...budget, limit }
            : budget
        );
      }

      return [...previousBudgets, { category, limit }];
    });
  };

  const getStatus = (percentage, limit) => {
    if (limit <= 0) {
      return { label: 'Set a limit', className: 'untracked' };
    }

    if (percentage >= 100) {
      return { label: 'Limit reached', className: 'exceeded' };
    }

    if (percentage >= 80) {
      return { label: 'Near limit', className: 'warning' };
    }

    return { label: 'On track', className: 'safe' };
  };

  const formatMoney = (amount) =>
    `KES ${Number(amount || 0).toLocaleString('en-KE', {
      maximumFractionDigits: 2,
    })}`;

  const budgetOverview = activeCategories.reduce(
    (overview, category) => {
      const budget = findBudget(budgets, category);
      const limit = Number(budget?.limit) || 0;
      const spent = getSpentAmount(category);

      return {
        totalLimit: overview.totalLimit + limit,
        totalSpent: overview.totalSpent + spent,
        trackedCategories: overview.trackedCategories + (limit > 0 ? 1 : 0),
      };
    },
    { totalLimit: 0, totalSpent: 0, trackedCategories: 0 }
  );
  const remainingBudget = budgetOverview.totalLimit - budgetOverview.totalSpent;
  const overallPercentage =
    budgetOverview.totalLimit > 0
      ? (budgetOverview.totalSpent / budgetOverview.totalLimit) * 100
      : 0;

  return (
    <div className="budget-page">
      <header className="budget-page-header">
        <div>
          <p className="budget-eyebrow">
            SMARTPESA <span>/</span> FINANCIAL PLANNER
          </p>
          <h1>Your budgets, at a glance</h1>
          <p className="budget-description">
            Set monthly limits, keep an eye on your spending, and stay in control.
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
          <div className="budget-overview-icon" aria-hidden="true">
            ↗
          </div>
          <div>
            <p className="budget-overview-label">Total monthly budget</p>
            <strong>{formatMoney(budgetOverview.totalLimit)}</strong>
            <span>
              {budgetOverview.trackedCategories} of {activeCategories.length} categories set
            </span>
          </div>
        </article>
        <article className="budget-overview-card">
          <div className="budget-overview-icon spent" aria-hidden="true">
            −
          </div>
          <div>
            <p className="budget-overview-label">Spent so far</p>
            <strong>{formatMoney(budgetOverview.totalSpent)}</strong>
            <span>{Math.round(overallPercentage)}% of your total limit</span>
          </div>
        </article>
        <article className="budget-overview-card">
          <div
            className={`budget-overview-icon ${remainingBudget < 0 ? 'over' : 'remaining'}`}
            aria-hidden="true"
          >
            {remainingBudget < 0 ? '!' : '✓'}
          </div>
          <div>
            <p className="budget-overview-label">
              {remainingBudget < 0 ? 'Over budget' : 'Left to spend'}
            </p>
            <strong
              className={remainingBudget < 0 ? 'budget-total-over' : ''}
            >
              {formatMoney(Math.abs(remainingBudget))}
            </strong>
            <span>Across all categories</span>
          </div>
        </article>
      </section>

      <section
        className="budget-categories-section"
        aria-labelledby="budget-categories-title"
      >
        <div className="budget-section-heading">
          <div>
            <p className="budget-section-kicker">MONTHLY PLAN</p>
            <h2 id="budget-categories-title">Category budgets</h2>
            <p>Choose a limit for each category and track your progress.</p>
          </div>
          <span className="budget-category-count">
            {activeCategories.length}{' '}
            {activeCategories.length === 1 ? 'category' : 'categories'}
          </span>
        </div>

        {activeCategories.length > 0 ? (
          <div className="budget-grid">
            {activeCategories.map((category) => {
              const budget = findBudget(budgets, category) || {
                category,
                limit: 0,
              };
              const spent = getSpentAmount(category);
              const limit = Number(budget.limit) || 0;
              const percentage = limit > 0 ? (spent / limit) * 100 : 0;
              const barWidth = Math.min(percentage, 100);
              const status = getStatus(percentage, limit);

              return (
                <article className="budget-card" key={category}>
                  <div className="budget-card-heading">
                    <div className="budget-category-icon" aria-hidden="true">
                      {category.slice(0, 1).toUpperCase()}
                    </div>
                    <span className={`status-badge ${status.className}`}>
                      <span className="status-indicator" aria-hidden="true" />
                      {status.label}
                    </span>
                  </div>

                  <h2 className="budget-category-title">{category}</h2>

                  <div className="budget-amounts">
                    <div>
                      <span className="budget-label">Spent so far</span>
                      <strong className="budget-spent">
                        {formatMoney(spent)}
                      </strong>
                    </div>
                    <div>
                      <span className="budget-label">Budget limit</span>
                      <strong className="budget-limit-value">
                        {formatMoney(limit)}
                      </strong>
                    </div>
                  </div>

                  <div className="budget-progress-heading">
                    <span>Monthly progress</span>
                    <strong
                      className={percentage >= 100 ? 'budget-percent-over' : ''}
                    >
                      {Math.round(percentage)}%
                    </strong>
                  </div>

                  <div
                    className="progress-container"
                    role="progressbar"
                    aria-label={`${category} budget used`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(barWidth)}
                  >
                    <div
                      className={`progress-bar ${status.className}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>

                  <div className="budget-card-footer">
                    <p className="budget-remaining">
                      {limit > 0
                        ? percentage >= 100
                          ? `${formatMoney(spent - limit)} over budget`
                          : `${formatMoney(limit - spent)} remaining`
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
                          value={budget.limit}
                          onChange={(event) =>
                            updateBudget(category, event.target.value)
                          }
                          aria-label={`Budget limit for ${category}`}
                        />
                      </span>
                    </label>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="budget-empty-state">
            <div className="budget-empty-icon" aria-hidden="true">
              +
            </div>
            <h3>No budget categories yet</h3>
            <p>Add categories in Settings to start building your monthly plan.</p>
          </div>
        )}
      </section>
    </div>
  );
}
main
