import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { formatKES } from '../utils/money';
import { useToast } from '../components/Toast';
import { Loading } from '../components/Loading';
import { currentMonth } from '../config';
import { useAuth } from '../context/AuthContext';

export function HomePage() {
  const { user } = useAuth();
  const userId = user.id;
  const showToast = useToast();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await api(`/api/dashboard?user_id=${userId}&month=${currentMonth()}`);
        if (!cancelled) {
          setDashboard(data);
          setError('');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          showToast(err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [showToast, userId]);

  if (loading) return <Loading text="Loading your overview..." />;
  if (error || !dashboard) {
    return <p style={{ color: 'var(--danger)' }}>Could not load the dashboard: {error}</p>;
  }

  const totalBudget = dashboard.total_budget_cents;
  const totalSpent = dashboard.total_spent_cents;
  const remainingBudget = dashboard.remaining_cents;
  const percentageUsed = totalBudget
    ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100)
    : 0;

  // Transactions only carry budget_id, so look the category name up from the budgets
  const categoryById = Object.fromEntries(
    dashboard.budgets.map((b) => [b.id, b.category])
  );

  return (
    <div className="home-page">
      <header className="home-heading">
        <h1>M-Pesa Spending Overview</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Track, manage, and analyze your day-to-day M-Pesa expenses.
        </p>
      </header>

      {/* Summary KPI Cards */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <h4>Total Monthly Budget</h4>
          <div className="amount">{formatKES(totalBudget)}</div>
        </div>

        <div className="stat-card">
          <h4>Total Spent So Far</h4>
          <div className="amount" style={{ color: totalSpent > totalBudget ? 'var(--danger)' : 'var(--text-primary)' }}>
            {formatKES(totalSpent)}
          </div>
        </div>

        <div className="stat-card">
          <h4>Remaining Balance</h4>
          <div className="amount amount-highlight">
            {formatKES(remainingBudget)}
          </div>
        </div>
      </div>

      {/* Visual Progress Gauge */}
      <div className="stat-card home-usage-card">
        <div className="home-usage-heading">
          <span>Overall Budget Consumption</span>
          <strong>{percentageUsed}% Used</strong>
        </div>
        <div style={{ width: '100%', height: '12px', background: '#334155', borderRadius: '6px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${percentageUsed}%`,
              height: '100%',
              backgroundColor: percentageUsed > 90 ? 'var(--danger)' : 'var(--mpesa-green)',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="stat-card home-recent-card">
        <h3 style={{ marginBottom: '16px' }}>Recent M-Pesa Transactions</h3>
        {dashboard.recent_transactions.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No transactions yet.</p>
        ) : (
          <div className="home-recent-list">
            {dashboard.recent_transactions.slice(0, 4).map((tx) => (
              <div className="home-recent-row" key={tx.id}>
                <div className="home-recent-details">
                  <strong>{tx.description}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {categoryById[tx.budget_id] || 'Uncategorized'} • {new Date(tx.occurred_at).toLocaleDateString('en-CA')}
                  </div>
                </div>
                <div className="home-recent-amount">
                  - {formatKES(tx.amount_cents)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}