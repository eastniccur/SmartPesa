import { useState } from 'react';

export function SettingsPage({ categories, setCategories, currency, setCurrency, onReset }) {
  const [categoryName, setCategoryName] = useState('');
  const [categoryMessage, setCategoryMessage] = useState('');
  const [authView, setAuthView] = useState('login');
  const [authMessage, setAuthMessage] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  function addCategory(event) {
    event.preventDefault();
    const trimmedName = categoryName.trim();

    if (!trimmedName) return;
    if (categories.some((category) => category.toLowerCase() === trimmedName.toLowerCase())) {
      setCategoryMessage('That category already exists.');
      return;
    }

    setCategories([...categories, trimmedName]);
    setCategoryName('');
    setCategoryMessage(`${trimmedName} added.`);
  }

  function removeCategory(categoryToRemove) {
    setCategories(categories.filter((category) => category !== categoryToRemove));
    setCategoryMessage(`${categoryToRemove} removed.`);
  }

  function handleReset() {
    onReset();
    setCategoryMessage('');
    setResetMessage('Application data restored to defaults.');
  }

  function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthMessage(authView === 'login' ? 'Demo sign-in submitted.' : 'Demo account details submitted.');
  }

  return (
    <div className="settings-page">
      <header className="settings-heading">
        <p className="settings-eyebrow">PREFERENCES & ACCOUNT</p>
        <h1>Settings</h1>
        <p>Manage your spending categories, display preferences, and account access.</p>
      </header>

      <div className="settings-layout">
        <div className="settings-column">
          <section className="settings-panel" aria-labelledby="preferences-title">
            <div className="settings-panel-heading">
              <div>
                <p className="settings-eyebrow">PERSONALIZE</p>
                <h2 id="preferences-title">Preferences</h2>
              </div>
            </div>
            <label className="settings-field" htmlFor="currency">
              <span>Default currency</span>
              <select id="currency" value={currency} onChange={(event) => setCurrency(event.target.value)}>
                <option value="KES">KES - Kenyan Shilling</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </label>
          </section>

          <section className="settings-panel" aria-labelledby="categories-title">
            <div className="settings-panel-heading">
              <div>
                <p className="settings-eyebrow">ORGANIZE</p>
                <h2 id="categories-title">Transaction categories</h2>
              </div>
              <span className="settings-count">{categories.length}</span>
            </div>
            <form className="category-form" onSubmit={addCategory}>
              <label className="settings-field" htmlFor="category-name">
                <span>Add a category</span>
                <span className="category-input-row">
                  <input
                    id="category-name"
                    value={categoryName}
                    onChange={(event) => setCategoryName(event.target.value)}
                    placeholder="e.g. Health"
                    maxLength={32}
                  />
                  <button className="button-primary" type="submit">Add</button>
                </span>
              </label>
            </form>
            <ul className="category-list">
              {categories.map((category) => (
                <li className="category-row" key={category}>
                  <span className="category-mark" aria-hidden="true" />
                  <span>{category}</span>
                  <button
                    className="button-text-danger"
                    type="button"
                    onClick={() => removeCategory(category)}
                    aria-label={`Remove ${category}`}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <p className="settings-status" role="status" aria-live="polite">{categoryMessage}</p>
          </section>

          <section className="settings-reset" aria-labelledby="reset-title">
            <div>
              <h2 id="reset-title">Reset application data</h2>
              <p>Restore transactions, budgets, categories, and preferences to their original defaults.</p>
            </div>
            <button className="button-danger" type="button" onClick={handleReset}>Reset Data</button>
            <p className="settings-status" role="status" aria-live="polite">{resetMessage}</p>
          </section>
        </div>

        <section className="settings-panel auth-panel" aria-labelledby="auth-title">
          <div className="settings-panel-heading">
            <div>
              <p className="settings-eyebrow">SECURE ACCESS</p>
              <h2 id="auth-title">Welcome to SmartPesa</h2>
            </div>
          </div>
          <div className="auth-tabs" role="tablist" aria-label="Account access">
            <button
              className={authView === 'login' ? 'auth-tab is-active' : 'auth-tab'}
              id="login-tab"
              type="button"
              role="tab"
              aria-selected={authView === 'login'}
              aria-controls="auth-form-panel"
              onClick={() => { setAuthView('login'); setAuthMessage(''); }}
            >
              Login
            </button>
            <button
              className={authView === 'register' ? 'auth-tab is-active' : 'auth-tab'}
              id="register-tab"
              type="button"
              role="tab"
              aria-selected={authView === 'register'}
              aria-controls="auth-form-panel"
              onClick={() => { setAuthView('register'); setAuthMessage(''); }}
            >
              Register
            </button>
          </div>
          <form
            className="auth-form"
            id="auth-form-panel"
            role="tabpanel"
            aria-labelledby={`${authView}-tab`}
            onSubmit={handleAuthSubmit}
          >
            <label className="settings-field" htmlFor="phone-number">
              <span>Phone number</span>
              <input
                id="phone-number"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+254 7XX XXX XXX"
                pattern="[+0-9() -]{7,20}"
                required
              />
            </label>
            <label className="settings-field" htmlFor="account-pin">
              <span>4-digit PIN</span>
              <input
                id="account-pin"
                type="password"
                inputMode="numeric"
                autoComplete={authView === 'login' ? 'current-password' : 'new-password'}
                placeholder="••••"
                pattern="[0-9]{4}"
                maxLength={4}
                required
              />
            </label>
            <button className="button-primary auth-submit" type="submit">
              {authView === 'login' ? 'Login' : 'Create account'}
            </button>
            <p className="settings-status" role="status" aria-live="polite">{authMessage}</p>
          </form>
        </section>
      </div>
    </div>
  );
}

