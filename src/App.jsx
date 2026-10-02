import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { TransactionsPage } from './pages/TransactionsPage';
import { BudgetPage } from './pages/BudgetPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { SettingsPage } from './pages/SettingsPage';
import { initialTransactions, initialBudgets } from './data/mockData';

const initialCategories = [...new Set([
  ...Object.keys(initialBudgets),
  ...initialTransactions.map(({ category }) => category),
])];

function readStoredValue(key, fallback) {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue === null ? fallback : JSON.parse(storedValue);
  } catch {
    return fallback;
  }
}

function storeValue(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Keep the current session usable when browser storage is unavailable.
  }
}

function App() {
  const [transactions, setTransactions] = useState(() => readStoredValue('smartpesa-transactions', initialTransactions));
  const [budgets, setBudgets] = useState(() => readStoredValue('smartpesa-budgets', initialBudgets));
  const [categories, setCategories] = useState(() => readStoredValue('smartpesa-categories', initialCategories));
  const [currency, setCurrency] = useState(() => readStoredValue('smartpesa-currency', 'KES'));

  useEffect(() => storeValue('smartpesa-transactions', transactions), [transactions]);
  useEffect(() => storeValue('smartpesa-budgets', budgets), [budgets]);
  useEffect(() => storeValue('smartpesa-categories', categories), [categories]);
  useEffect(() => storeValue('smartpesa-currency', currency), [currency]);

  function resetApplicationData() {
    setTransactions(initialTransactions);
    setBudgets(initialBudgets);
    setCategories(initialCategories);
    setCurrency('KES');
  }

  return (
    <BrowserRouter>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage transactions={transactions} budgets={budgets} />} />
          <Route path="/transactions" element={<TransactionsPage transactions={transactions} setTransactions={setTransactions} />} />
          <Route path="/budget" element={<BudgetPage transactions={transactions} budgets={budgets} setBudgets={setBudgets} />} />
          <Route path="/analysis" element={<AnalysisPage transactions={transactions} budgets={budgets} />} />
          <Route path="/settings" element={(
            <SettingsPage
              categories={categories}
              setCategories={setCategories}
              currency={currency}
              setCurrency={setCurrency}
              onReset={resetApplicationData}
            />
          )} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;