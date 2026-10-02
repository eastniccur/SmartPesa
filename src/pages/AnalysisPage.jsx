
import React, { useMemo } from "react";

export function AnalysisPage({ transactions = [] }) {
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const getAmount = (transaction) =>
    Number(
      transaction.amount ??
      transaction.value ??
      transaction.transaction_amount ??
      0
    ) || 0;

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

  const analysis = useMemo(() => {
    const now = new Date();

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
    });

    const categoryList = Object.entries(categories)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);

    return {
      totalTransactions: safeTransactions.length,
      expenseTotal,
      monthlyExpenses,
      categoryList,
      largestCategory: categoryList[0] || null,
    };
  }, [safeTransactions]);

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
          Understand your M-Pesa spending distribution across categories.
        </p>
      </header>

      {/* KPI Summary Grid */}
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
            Spending by Category
          </h3>

          {analysis.categoryList.length === 0 ? (
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
                    {percentage.toFixed(1)}% of total expenses
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Top Spender Insights Card */}
        <div className="stat-card">
          <h3 style={{ fontSize: "1.1rem", marginBottom: "16px", color: "var(--text-primary)" }}>
            Spending Insights
          </h3>

          {analysis.largestCategory && (
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
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
