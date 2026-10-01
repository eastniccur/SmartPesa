import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { TransactionsPage } from './pages/TransactionsPage';
import { BudgetPage } from './pages/BudgetPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { SettingsPage } from './pages/SettingsPage';
import { initialTransactions, initialBudgets } from './data/mockData';

function App() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [budgets, setBudgets] = useState(initialBudgets);

  return (
    <BrowserRouter>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage transactions={transactions} budgets={budgets} />} />
          <Route path="/transactions" element={<TransactionsPage transactions={transactions} setTransactions={setTransactions} />} />
          <Route path="/budget" element={<BudgetPage transactions={transactions} budgets={budgets} setBudgets={setBudgets} />} />
          <Route path="/analysis" element={<AnalysisPage transactions={transactions} budgets={budgets} />} />
          <Route path="/settings" element={<SettingsPage budgets={budgets} setBudgets={setBudgets} />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;