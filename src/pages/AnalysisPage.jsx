<<<<<<< HEAD
import React, { useMemo } from "react";

export function AnalysisPage({ transactions = [] }) {
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
=======
import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { formatKES } from '../utils/money';
import { useToast } from '../components/Toast';
import { Loading } from '../components/Loading';
import {  currentMonth } from '../config';
import { useAuth } from '../context/AuthContext';

export function AnalysisPage() {
  const { user } = useAuth();
  const userId = user.id;
  const showToast = useToast();
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
>>>>>>> fbdf4b6 (complete frontend intergration)

    async function load() {
      try {
        const [txData, budgetData] = await Promise.all([
          api(`/api/transactions?user_id=${userId}`),
          api(`/api/budgets?user_id=${userId}`),
        ]);
        if (!cancelled) {
          setTransactions(txData.transactions);
          setBudgets(budgetData.budgets);
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

<<<<<<< HEAD
  const getCategory = (transaction) =>
    transaction.category ||
    transaction.type ||
    "Other";

  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    }).format(amount);
=======
    load();
    return () => { cancelled = true; };
  }, [showToast, userId]);
>>>>>>> fbdf4b6 (complete frontend intergration)

  const analysis = useMemo(() => {
    const month = currentMonth();
    const budgetsById = Object.fromEntries(budgets.map((b) => [b.id, b]));
    const categoryOf = (tx) => budgetsById[tx.budget_id]?.category || 'Uncategorized';

<<<<<<< HEAD
    // 1. Filter expenses (All M-Pesa outgoing transactions in mock data are expenses)
    const expenses = safeTransactions.filter((transaction) => {
      const type = String(
        transaction.type ||
        transaction.transaction_type ||
        ""
      ).toLowerCase();

      // Handles Paybill, Till Number, Airtime, Send Money, etc.
      return (
        type.includes("paybill") ||
        type.includes("till") ||
        type.includes("airtime") ||
        type.includes("send") ||
        type.includes("expense") ||
        type.includes("payment") ||
        type.length === 0 // Default fallback
      );
    });

    const expenseTotal = expenses.reduce(
      (total, transaction) => total + getAmount(transaction),
      0
    );

    // 2. Calculate current month expenses accurately
    const monthlyExpenses = expenses.reduce((total, transaction) => {
      if (!transaction.date) return total + getAmount(transaction);
      const [year, month] = transaction.date.split("-").map(Number);
      const isCurrentMonth = 
        month === (now.getMonth() + 1) && 
        year === now.getFullYear();

      return isCurrentMonth ? total + getAmount(transaction) : total;
    }, 0);

    // 3. Aggregate totals per category
    const categories = {};
    expenses.forEach((transaction) => {
      const category = getCategory(transaction);
      categories[category] =
        (categories[category] || 0) + getAmount(transaction);
=======
    const expenseTotal = transactions.reduce((sum, tx) => sum + tx.amount_cents, 0);

    const monthlyExpenses = transactions.reduce((sum, tx) => {
      const txMonth = new Date(tx.occurred_at).toISOString().slice(0, 7);
      return txMonth === month ? sum + tx.amount_cents : sum;
    }, 0);

    const byCategory = {};
    transactions.forEach((tx) => {
      const name = categoryOf(tx);
      byCategory[name] = (byCategory[name] || 0) + tx.amount_cents;
>>>>>>> fbdf4b6 (complete frontend intergration)
    });
    const categoryList = Object.entries(byCategory)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);

    const budgetUsage = budgets
      .filter((b) => b.month === month && b.limit_cents > 0)
      .map((b) => ({ ...b, percentage: (b.spent_cents / b.limit_cents) * 100 }))
      .sort((a, b) => b.percentage - a.percentage);

    return {
      month,
      totalTransactions: transactions.length,
      expenseTotal,
      monthlyExpenses,
      categoryList,
      largestCategory: categoryList[0] || null,
      budgetUsage,
      overBudget: budgetUsage.filter((b) => b.percentage >= 100),
      nearLimit: budgetUsage.filter((b) => b.percentage >= 80 && b.percentage < 100),
    };
  }, [transactions, budgets]);

<<<<<<< HEAD
  return (
    <div>
      <header style={{ marginBottom: "28px" }}>
        <p style={{ color: "var(--mpesa-green)", fontSize: "12px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>
          SmartPesa / ANALYTICS
        </p>
        <h1 style={{ fontSize: "2rem", color: "var(--text-primary)", margin: "8px 0" }}>
          Spending Analysis
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
=======
  if (loading) return <Loading text="Analyzing your spending..." />;
  if (error && transactions.length === 0 && budgets.length === 0) {
    return <p style={{ color: 'var(--danger)' }}>Could not load analysis: {error}</p>;
  }

  return (
    <div>
      <header style={{ marginBottom: '28px' }}>
        <p style={{ color: 'var(--mpesa-green)', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
          SmartPesa / ANALYTICS
        </p>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: '8px 0' }}>
          Spending Analysis
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
>>>>>>> fbdf4b6 (complete frontend intergration)
          Understand your M-Pesa spending distribution across categories.
        </p>
      </header>

      {/* KPI Summary Grid */}
<<<<<<< HEAD
      <section className="dashboard-grid" style={{ marginBottom: "24px" }}>
        <div className="stat-card">
          <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Total Transactions</p>
          <div className="amount" style={{ margin: "8px 0" }}>{analysis.totalTransactions}</div>
          <p style={{ color: "var(--text-secondary)", fontSize: "12px" }}>Recorded in system</p>
        </div>

        <div className="stat-card">
          <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Total Expenses</p>
          <div className="amount amount-highlight" style={{ margin: "8px 0" }}>
            {formatMoney(analysis.expenseTotal)}
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "12px" }}>Across all categories</p>
        </div>

        <div className="stat-card">
          <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>This Month's Expenses</p>
          <div className="amount" style={{ margin: "8px 0", color: "#38bdf8" }}>
            {formatMoney(analysis.monthlyExpenses)}
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "12px" }}>Based on current date</p>
        </div>
      </section>

      {/* Category Breakdown & Insights */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
        {/* Category Progress Bars */}
        <div className="stat-card">
          <h3 style={{ fontSize: "1.1rem", marginBottom: "16px", color: "var(--text-primary)" }}>
=======
      <section className="dashboard-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Total Transactions</p>
          <div className="amount" style={{ margin: '8px 0' }}>{analysis.totalTransactions}</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Recorded in system</p>
        </div>

        <div className="stat-card">
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Total Expenses</p>
          <div className="amount amount-highlight" style={{ margin: '8px 0' }}>
            {formatKES(analysis.expenseTotal)}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Across all categories</p>
        </div>

        <div className="stat-card">
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>This Month's Expenses</p>
          <div className="amount" style={{ margin: '8px 0', color: '#38bdf8' }}>
            {formatKES(analysis.monthlyExpenses)}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{analysis.month}</p>
        </div>
      </section>

      {/* Overspend warnings */}
      {(analysis.overBudget.length > 0 || analysis.nearLimit.length > 0) && (
        <section className="stat-card" style={{ marginBottom: '24px', border: '1px solid var(--danger)' }} role="alert">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'var(--danger)' }}>
            Budget warnings for {analysis.month}
          </h3>
          {analysis.overBudget.map((b) => (
            <p key={b.id} style={{ margin: '4px 0' }}>
              <strong>{b.category}</strong> is over budget by {formatKES(b.spent_cents - b.limit_cents)}.
            </p>
          ))}
          {analysis.nearLimit.map((b) => (
            <p key={b.id} style={{ margin: '4px 0', color: 'var(--text-secondary)' }}>
              <strong>{b.category}</strong> is at {Math.round(b.percentage)}% of its limit.
            </p>
          ))}
        </section>
      )}

      {/* Category Breakdown, Budget Usage and Insights */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Spending by category */}
        <div className="stat-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-primary)' }}>
>>>>>>> fbdf4b6 (complete frontend intergration)
            Spending by Category
          </h3>

          {analysis.categoryList.length === 0 ? (
<<<<<<< HEAD
            <p style={{ color: "var(--text-secondary)" }}>No transaction data available.</p>
          ) : (
            analysis.categoryList.map((category) => {
              const percentage =
                analysis.expenseTotal > 0
                  ? (category.amount / analysis.expenseTotal) * 100
                  : 0;

              return (
                <div key={category.name} style={{ marginBottom: "18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "14px" }}>
                    <span style={{ color: "var(--text-primary)" }}>{category.name}</span>
                    <strong>{formatMoney(category.amount)}</strong>
                  </div>

                  <div style={{ background: "#334155", borderRadius: "6px", height: "10px", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                        height: "100%",
                        backgroundColor: "var(--mpesa-green)",
                        borderRadius: "6px",
                      }}
                    />
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: "12px", marginTop: "4px" }}>
=======
            <p style={{ color: 'var(--text-secondary)' }}>No transaction data available.</p>
          ) : (
            analysis.categoryList.map((category) => {
              const percentage = analysis.expenseTotal > 0
                ? (category.amount / analysis.expenseTotal) * 100
                : 0;

              return (
                <div key={category.name} style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
                    <span style={{ color: 'var(--text-primary)' }}>{category.name}</span>
                    <strong>{formatKES(category.amount)}</strong>
                  </div>
                  <div style={{ background: '#334155', borderRadius: '6px', height: '10px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                        height: '100%',
                        backgroundColor: 'var(--mpesa-green)',
                        borderRadius: '6px',
                      }}
                    />
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>
>>>>>>> fbdf4b6 (complete frontend intergration)
                    {percentage.toFixed(1)}% of total expenses
                  </p>
                </div>
              );
            })
          )}
        </div>

<<<<<<< HEAD
        {/* Top Spender Insights Card */}
        <div className="stat-card">
          <h3 style={{ fontSize: "1.1rem", marginBottom: "16px", color: "var(--text-primary)" }}>
=======
        {/* Budget usage this month */}
        <div className="stat-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-primary)' }}>
            Budget Usage ({analysis.month})
          </h3>

          {analysis.budgetUsage.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No budgets with a limit set for this month.</p>
          ) : (
            analysis.budgetUsage.map((b) => (
              <div key={b.id} style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-primary)' }}>{b.category}</span>
                  <strong>{formatKES(b.spent_cents)} / {formatKES(b.limit_cents)}</strong>
                </div>
                <div style={{ background: '#334155', borderRadius: '6px', height: '10px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(b.percentage, 100)}%`,
                      height: '100%',
                      backgroundColor: b.percentage >= 100 ? 'var(--danger)' : b.percentage >= 80 ? '#f59e0b' : 'var(--mpesa-green)',
                      borderRadius: '6px',
                    }}
                  />
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>
                  {Math.round(b.percentage)}% used
                </p>
              </div>
            ))
          )}
        </div>

        {/* Insights */}
        <div className="stat-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-primary)' }}>
>>>>>>> fbdf4b6 (complete frontend intergration)
            Spending Insights
          </h3>

          {analysis.largestCategory && (
<<<<<<< HEAD
            <div style={{ background: "rgba(0, 168, 89, 0.1)", border: "1px solid var(--mpesa-green)", borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
              <p style={{ color: "var(--text-secondary)", fontSize: "12px", margin: 0 }}>
                Highest Spending Category
              </p>
              <h2 style={{ color: "var(--mpesa-green)", margin: "6px 0" }}>
                {analysis.largestCategory.name}
              </h2>
              <strong>{formatMoney(analysis.largestCategory.amount)}</strong>
            </div>
          )}

          <div style={{ border: "1px solid var(--border-color)", borderRadius: "8px", padding: "16px" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "12px", margin: 0 }}>
              Summary Overview
            </p>
            <p style={{ color: "var(--text-primary)", fontSize: "14px", lineHeight: "1.6", marginTop: "8px" }}>
              You have recorded <strong>{analysis.totalTransactions}</strong> transaction(s) totaling{" "}
              <strong>{formatMoney(analysis.expenseTotal)}</strong>.
=======
            <div style={{ background: 'rgba(0, 168, 89, 0.1)', border: '1px solid var(--mpesa-green)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: 0 }}>
                Highest Spending Category
              </p>
              <h2 style={{ color: 'var(--mpesa-green)', margin: '6px 0' }}>
                {analysis.largestCategory.name}
              </h2>
              <strong>{formatKES(analysis.largestCategory.amount)}</strong>
            </div>
          )}

          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: 0 }}>
              Summary Overview
            </p>
            <p style={{ color: 'var(--text-primary)', fontSize: '14px', lineHeight: '1.6', marginTop: '8px' }}>
              You have recorded <strong>{analysis.totalTransactions}</strong> transaction(s) totaling{' '}
              <strong>{formatKES(analysis.expenseTotal)}</strong>.
>>>>>>> fbdf4b6 (complete frontend intergration)
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}