import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ToastProvider } from './components/Toast';
import { HomePage } from './pages/HomePage';
import { TransactionsPage } from './pages/TransactionsPage';
import { BudgetPage } from './pages/BudgetPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthProvider } from './context/AuthContext';
import { RequireAuth } from './components/RequireAuth';
import { LoginPage } from './pages/LoginPage';

const DEFAULT_CATEGORIES = ['Food', 'Shopping', 'Utilities', 'Entertainment', 'Transport'];

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
  // Local display preferences only. Budgets and transactions now live in the backend.
  const [categories, setCategories] = useState(() => readStoredValue('smartpesa-categories', DEFAULT_CATEGORIES));
  const [currency, setCurrency] = useState(() => readStoredValue('smartpesa-currency', 'KES'));

  useEffect(() => storeValue('smartpesa-categories', categories), [categories]);
  useEffect(() => storeValue('smartpesa-currency', currency), [currency]);

  function resetApplicationData() {
    setCategories(DEFAULT_CATEGORIES);
    setCurrency('KES');
  }

    return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <main className="container">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<RequireAuth />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/budget" element={<BudgetPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/analysis" element={<AnalysisPage />} />
                <Route path="/settings" element={(
                  <SettingsPage
                    categories={categories}
                    setCategories={setCategories}
                    currency={currency}
                    setCurrency={setCurrency}
                    onReset={resetApplicationData}
                  />
                )} />
              </Route>
            </Routes>
          </main>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;