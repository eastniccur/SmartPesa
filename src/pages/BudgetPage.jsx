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