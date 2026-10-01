import React from 'react';

export function HomePage({ transactions, budgets }) {
  // 1. Calculate Total Spent across all transactions
  const totalSpent = transactions.reduce((acc, curr) => acc + curr.amount, 0);

  // 2. Calculate Total Budgeted Amount across all categories
  const totalBudget = Object.values(budgets).reduce((acc, curr) => acc + curr, 0);

  // 3. Calculate Remaining Budget
  const remainingBudget = totalBudget - totalSpent;
  const percentageUsed = Math.min(Math.round((totalSpent / totalBudget) * 100), 100);

  return (
    <div>
      <header style={{ marginBottom: '24px' }}>
        <h1>M-Pesa Spending Overview</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Track, manage, and analyze your day-to-day M-Pesa expenses.
        </p>
      </header>

      {/* Summary KPI Cards */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <h4>Total Monthly Budget</h4>
          <div className="amount">KES {totalBudget.toLocaleString()}</div>
        </div>

        <div className="stat-card">
          <h4>Total Spent So Far</h4>
          <div className="amount" style={{ color: totalSpent > totalBudget ? 'var(--danger)' : 'var(--text-primary)' }}>
            KES {totalSpent.toLocaleString()}
          </div>
        </div>

        <div className="stat-card">
          <h4>Remaining Balance</h4>
          <div className="amount amount-highlight">
            KES {remainingBudget.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Visual Progress Gauge */}
      <div className="stat-card" style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Overall Budget Consumption</span>
          <strong>{percentageUsed}% Used</strong>
        </div>
        <div style={{ width: '100%', height: '12px', background: '#334155', borderRadius: '6px', overflow: 'hidden' }}>
          <div 
            style={{ 
              width: `${percentageUsed}%`, 
              height: '100%', 
              backgroundColor: percentageUsed > 90 ? 'var(--danger)' : 'var(--mpesa-green)',
              transition: 'width 0.4s ease'
            }} 
          />
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="stat-card" style={{ marginTop: '20px' }}>
        <h3 style={{ marginBottom: '16px' }}>Recent M-Pesa Transactions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {transactions.slice(0, 4).map((tx) => (
            <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <strong>{tx.title}</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {tx.category} • {tx.date}
                </div>
              </div>
              <div style={{ fontWeight: '700', color: 'var(--danger)' }}>
                - KES {tx.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}