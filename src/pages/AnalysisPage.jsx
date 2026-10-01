
import React, { useMemo } from "react";

function AnalysisPage({ transactions = [] }) {
  const safeTransactions = Array.isArray(transactions)
    ? transactions
    : [];

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
    transaction.description ||
    transaction.transaction_type ||
    "Other";

  const getDate = (transaction) =>
    transaction.date ||
    transaction.transaction_date ||
    transaction.created_at ||
    "";

  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 2,
    }).format(amount);

  const analysis = useMemo(() => {
    const now = new Date();

    const thisMonth = safeTransactions.filter((transaction) => {
      const date = new Date(getDate(transaction));

      return (
        !Number.isNaN(date.getTime()) &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    });

    const expenses = safeTransactions.filter((transaction) => {
      const type = String(
        transaction.type ||
        transaction.transaction_type ||
        transaction.category ||
        ""
      ).toLowerCase();

      return (
        type.includes("expense") ||
        type.includes("payment") ||
        type.includes("send") ||
        type.includes("withdraw") ||
        type.includes("buy goods") ||
        type.includes("paybill") ||
        type.includes("airtime")
      );
    });

    const expenseTotal = expenses.reduce(
      (total, transaction) => total + getAmount(transaction),
      0
    );

    const monthlyExpenses = thisMonth.reduce((total, transaction) => {
      const type = String(
        transaction.type ||
        transaction.transaction_type ||
        transaction.category ||
        ""
      ).toLowerCase();

      const isExpense =
        type.includes("expense") ||
        type.includes("payment") ||
        type.includes("send") ||
        type.includes("withdraw") ||
        type.includes("buy goods") ||
        type.includes("paybill") ||
        type.includes("airtime");

      return isExpense ? total + getAmount(transaction) : total;
    }, 0);

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

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e8e8ef",
    borderRadius: "16px",
    padding: "20px",
    minWidth: 0,
  };

  const headingStyle = {
    color: "#24243a",
    fontSize: "15px",
    fontWeight: 600,
    marginBottom: "12px",
  };

  const mutedStyle = {
    color: "#77778b",
    fontSize: "13px",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f7fb",
        padding: "clamp(16px, 4vw, 32px)",
        fontFamily: "Inter, Arial, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <header style={{ marginBottom: "28px" }}>
          <p
            style={{
              color: "#7357d9",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
            }}
          >
            PESALENS / INSIGHTS
          </p>

          <h1
            style={{
              fontSize: "clamp(26px, 5vw, 36px)",
              color: "#24243a",
              margin: "8px 0",
            }}
          >
            Spending Analysis
          </h1>

          <p style={{ ...mutedStyle, fontSize: "14px" }}>
            Understand your money. Make every shilling count.
          </p>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div style={cardStyle}>
            <p style={mutedStyle}>Total transactions</p>
            <h2 style={{ fontSize: "27px", color: "#24243a" }}>
              {analysis.totalTransactions}
            </h2>
            <p style={mutedStyle}>Transactions recorded</p>
          </div>

          <div style={cardStyle}>
            <p style={mutedStyle}>Recorded expenses</p>
            <h2 style={{ fontSize: "clamp(20px, 4vw, 27px)", color: "#7357d9" }}>
              {formatMoney(analysis.expenseTotal)}
            </h2>
            <p style={mutedStyle}>Across all available records</p>
          </div>

          <div style={cardStyle}>
            <p style={mutedStyle}>This month's expenses</p>
            <h2 style={{ fontSize: "clamp(20px, 4vw, 27px)", color: "#16866a" }}>
              {formatMoney(analysis.monthlyExpenses)}
            </h2>
            <p style={mutedStyle}>Based on transaction dates</p>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
            gap: "20px",
          }}
        >
          <div style={cardStyle}>
            <h2 style={headingStyle}>Spending by category</h2>

            {analysis.categoryList.length === 0 ? (
              <p style={mutedStyle}>
                No expense data available yet. Add transactions marked as
                expenses to see your breakdown.
              </p>
            ) : (
              analysis.categoryList.map((category) => {
                const percentage =
                  analysis.expenseTotal > 0
                    ? (category.amount / analysis.expenseTotal) * 100
                    : 0;

                return (
                  <div key={category.name} style={{ marginBottom: "22px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "12px",
                        marginBottom: "8px",
                        fontSize: "13px",
                      }}
                    >
                      <span style={{ color: "#44445a" }}>
                        {category.name}
                      </span>
                      <strong style={{ color: "#24243a" }}>
                        {formatMoney(category.amount)}
                      </strong>
                    </div>

                    <div
                      style={{
                        background: "#eeeaf9",
                        borderRadius: "20px",
                        height: "8px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                          height: "100%",
                          background: "#8264e8",
                          borderRadius: "20px",
                        }}
                      />
                    </div>

                    <p style={{ ...mutedStyle, marginTop: "5px" }}>
                      {percentage.toFixed(1)}% of recorded expenses
                    </p>
                  </div>
                );
              })
            )}
          </div>

          <div style={cardStyle}>
            <h2 style={headingStyle}>Spending insights</h2>

            {analysis.totalTransactions === 0 ? (
              <p style={mutedStyle}>
                Your insights will appear here once transaction data is
                available.
              </p>
            ) : (
              <>
                <div
                  style={{
                    background: "#f3efff",
                    borderRadius: "12px",
                    padding: "16px",
                    marginBottom: "14px",
                  }}
                >
                  <p style={{ ...mutedStyle, marginTop: 0 }}>
                    Highest spending category
                  </p>
                  <h3 style={{ color: "#7357d9", marginBottom: "6px" }}>
                    {analysis.largestCategory
                      ? analysis.largestCategory.name
                      : "Not available"}
                  </h3>
                  <strong style={{ color: "#24243a" }}>
                    {analysis.largestCategory
                      ? formatMoney(analysis.largestCategory.amount)
                      : "Add expense records to get started"}
                  </strong>
                </div>

                <div
                  style={{
                    border: "1px solid #e8e8ef",
                    borderRadius: "12px",
                    padding: "16px",
                  }}
                >
                  <p style={{ ...mutedStyle, marginTop: 0 }}>
                    Transaction overview
                  </p>
                  <p style={{ color: "#44445a", lineHeight: 1.7 }}>
                    You have {analysis.totalTransactions} recorded
                    transaction(s). Your recorded expenses total{" "}
                    <strong>{formatMoney(analysis.expenseTotal)}</strong>.
                    Review your categories to understand where your money
                    is going.
                  </p>
                </div>
              </>
            )}
          </div>
        </section>

        <p
          style={{
            ...mutedStyle,
            textAlign: "center",
            marginTop: "28px",
            lineHeight: 1.6,
          }}
        >
          Insights are calculated from the transaction data provided to
          PesaLens. Verify transaction categories and amounts for accuracy.
        </p>
      </div>
    </main>
  );
}

export { AnalysisPage };
export default AnalysisPage;