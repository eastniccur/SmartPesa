import { useEffect, useState } from 'react';
import { DEMO_USER_ID } from '../config';
import { LoadingState } from '../components/LoadingState';
import { useToast } from '../components/Toast';
import { api } from '../services/api';
import { formatKES } from '../utils/money';

function currentMonth() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : date.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function HomePage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [month] = useState(currentMonth);
  const showToast = useToast();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    api(`/api/dashboard?user_id=${DEMO_USER_ID}&month=${month}`, { signal: controller.signal })
      .then(setDashboard)
      .catch((error) => {
        if (controller.signal.aborted) return;
        showToast(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [month, retryCount, showToast]);

  const budgets = dashboard?.budgets ?? [];
  const transactions = dashboard?.recent_transactions ?? [];
  const totalBudget = dashboard?.total_budget_cents ?? 0;
  const totalSpent = dashboard?.total_spent_cents ?? 0;
  const overallPercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const progressWidth = Math.min(Math.max(overallPercent, 0), 100);

  return (
    <div className="home-page">
      <header className="home-heading">
        <p className="settings-eyebrow">MONTHLY OVERVIEW</p>
        <h1>M-Pesa Spending Overview</h1>
        <p>Track, manage, and analyze your day-to-day M-Pesa expenses.</p>
      </header>

      {loading ? (
        <LoadingState message="Loading your dashboard..." />
      ) : dashboard ? (
        <>
          <section className="dashboard-grid" aria-label="Monthly spending totals">
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
              <div className="amount" style={{ color: dashboard.remaining_cents < 0 ? 'var(--danger)' : 'var(--mpesa-green)' }}>
                {formatKES(dashboard.remaining_cents)}
              </div>
            </div>
            <div className="stat-card">
              <h4>Transactions This Month</h4>
              <div className="amount">{dashboard.transaction_count}</div>
            </div>
          </section>

          <section className="stat-card dashboard-section" aria-labelledby="overall-usage-title">
            <div className="dashboard-section-heading">
              <h2 id="overall-usage-title">Overall Budget Consumption</h2>
              <strong>{overallPercent}% used</strong>
            </div>
            <div className="progress-track" role="progressbar" aria-label="Overall budget used" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progressWidth}>
              <div
                className={`progress-fill${overallPercent > 90 ? ' is-warning' : ''}`}
                style={{ width: `${progressWidth}%` }}
              />
            </div>
            {budgets.length > 0 && (
              <div className="budget-usage-list">
                {budgets.map((budget) => {
                  const used = budget.percent_used ?? 0;
                  const width = Math.min(Math.max(used, 0), 100);
                  return (
                    <div className="budget-usage-row" key={budget.id}>
                      <div className="budget-usage-heading">
                        <strong>{budget.category}</strong>
                        <span>{used}% · {formatKES(budget.spent_cents)} of {formatKES(budget.limit_cents)}</span>
                      </div>
                      <div
                        className="progress-track budget-progress"
                        role="progressbar"
                        aria-label={`${budget.category} budget used`}
                        aria-valuemin="0"
                        aria-valuemax="100"
                        aria-valuenow={width}
                      >
                        <div
                          className={`progress-fill${budget.over_budget ? ' is-danger' : ''}`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                      <p className={budget.over_budget ? 'budget-remaining is-danger' : 'budget-remaining'}>
                        {formatKES(budget.remaining_cents)} remaining
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="stat-card dashboard-section" aria-labelledby="recent-transactions-title">
            <h2 id="recent-transactions-title">Recent M-Pesa Transactions</h2>
            {transactions.length > 0 ? (
              <ul className="recent-transaction-list">
                {transactions.map((transaction) => (
                  <li className="recent-transaction" key={transaction.id}>
                    <div>
                      <strong>{transaction.description}</strong>
                      <p>
                        {(transaction.transaction_type || 'other').replaceAll('_', ' ')}
                        {' · '}
                        {formatDate(transaction.occurred_at)}
                        {transaction.mpesa_code ? ` · ${transaction.mpesa_code}` : ''}
                      </p>
                    </div>
                    <strong className="recent-transaction-amount">{formatKES(transaction.amount_cents)}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="dashboard-empty-state">No transactions recorded yet this month.</p>
            )}
          </section>
        </>
      ) : (
        <section className="stat-card dashboard-error" role="status">
          <p>Dashboard data is unavailable right now.</p>
          <button className="button-primary" type="button" onClick={() => setRetryCount((count) => count + 1)}>
            Try again
          </button>
        </section>
      )}
    </div>
  );
}

