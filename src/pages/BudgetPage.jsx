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
