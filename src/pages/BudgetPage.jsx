function BudgetPage({
  budgets = [],
  setBudgets,
  transactions = [],
  categories = [],
}) {
  const getSpentAmount = (category) => {
    return transactions
      .filter((tx) => tx.category === category)
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  };

  const updateBudget = (category, newLimit) => {
    const limit = Math.max(0, Number(newLimit) || 0);

    setBudgets((previousBudgets) => {
      const existingBudget = previousBudgets.find(
        (budget) => budget.category === category
      );

      if (existingBudget) {
        return previousBudgets.map((budget) =>
          budget.category === category
            ? { ...budget, limit }
            : budget
        );
      }

      return [...previousBudgets, { category, limit }];
    });
  };

  const getStatus = (percentage) => {
    if (percentage >= 100) {
      return { label: "Limit reached", className: "exceeded" };
    }

    if (percentage >= 80) {
      return { label: "Near limit", className: "warning" };
    }

    return { label: "On track", className: "safe" };
  };

  const formatMoney = (amount) =>
    `KES ${Number(amount || 0).toLocaleString("en-KE", {
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="budget-page">
      <header className="budget-page-header">
        <div>
          <p className="budget-eyebrow">SMARTPESA • FINANCIAL PLANNER</p>
          <h1>Budget Management</h1>
          <p className="budget-description">
            Plan your spending, monitor expenses and stay within your limits.
          </p>
        </div>
        <div className="budget-header-icon" aria-hidden="true">
          ₭
        </div>
      </header>

      <div className="budget-grid">
        {categories.map((category) => {
          const budget = budgets.find(
            (item) => item.category === category
          ) || { category, limit: 0 };

          const spent = getSpentAmount(category);
          const limit = Number(budget.limit) || 0;
          const percentage =
            limit > 0 ? (spent / limit) * 100 : 0;

          const barWidth = Math.min(percentage, 100);
          const status = getStatus(percentage);

          return (
            <article className="budget-card" key={category}>
              <div className="budget-card-heading">
                <div className="budget-category-icon" aria-hidden="true">
               </div>
                <span className={`status-badge ${status.className}`}>
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
                <div className="budget-limit-summary">
                  <span className="budget-label">Budget limit</span>
                  <strong>{formatMoney(limit)}</strong>
                </div>
              </div>

              <div className="budget-progress-heading">
                <span>Budget used</span>
                <strong>{Math.round(percentage)}%</strong>
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

              <p className="budget-remaining">
                {limit > 0
                  ? percentage >= 100
                    ? `${formatMoney(spent - limit)} over budget`
                    : `${formatMoney(limit - spent)} remaining`
                  : "Set a limit to track your spending"}
              </p>

              <label className="budget-input-label">
                Set budget limit (KES)
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
              </label>
            </article>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="budget-empty-state">
          <h2>No budget categories yet</h2>
          <p>Add categories in Settings to start planning your budget.</p>
        </div>
      )}
    </div>
  );
}

export default BudgetPage;