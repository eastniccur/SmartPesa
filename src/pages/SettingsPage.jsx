<<<<<<< HEAD
import { useState } from 'react';
=======
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
>>>>>>> fbdf4b6 (complete frontend intergration)

export function SettingsPage({ categories, setCategories, currency, setCurrency, onReset }) {
  const [categoryName, setCategoryName] = useState('');
  const [categoryMessage, setCategoryMessage] = useState('');
<<<<<<< HEAD
  const [authView, setAuthView] = useState('login');
  const [authMessage, setAuthMessage] = useState('');
  const [resetMessage, setResetMessage] = useState('');
=======
  const [resetMessage, setResetMessage] = useState('');
  const showToast = useToast();
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const { user, login, logout } = useAuth();
  const userId = user.id;

  useEffect(() => {
    let cancelled = false;
    api(`/api/users/profile?user_id=${userId}`)
      .then((data) => {
        if (!cancelled) {
          setProfile({ name: data.user.name, email: data.user.email, phone: data.user.phone || '' });
        }
      })
      .catch((err) => { if (!cancelled) showToast(err.message); })
      .finally(() => { if (!cancelled) setProfileLoading(false); });
    return () => { cancelled = true; };
  }, [showToast, userId]);

  async function saveProfile(event) {
    event.preventDefault();
    setProfileSaving(true);
    setProfileMessage('');
    try {
      const data = await api(`/api/users/profile?user_id=${userId}`, {
        method: 'PUT',
        body: JSON.stringify(profile),
      });
      setProfile({ name: data.user.name, email: data.user.email, phone: data.user.phone || '' });
      login(data.user);
      setProfileMessage('Profile saved.');
      showToast('Profile saved', 'success');
    } catch (err) {
      setProfileMessage(err.message);
      showToast(err.message);
    } finally {
      setProfileSaving(false);
    }
  }

  const updateProfileField = (field) => (event) =>
    setProfile({ ...profile, [field]: event.target.value });
>>>>>>> fbdf4b6 (complete frontend intergration)

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

<<<<<<< HEAD
  function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthMessage(authView === 'login' ? 'Demo sign-in submitted.' : 'Demo account details submitted.');
  }

=======
>>>>>>> fbdf4b6 (complete frontend intergration)
  return (
    <div className="settings-page">
      <header className="settings-heading">
        <p className="settings-eyebrow">PREFERENCES & ACCOUNT</p>
        <h1>Settings</h1>
        <p>Manage your spending categories, display preferences, and account access.</p>
      </header>

      <div className="settings-layout">
        <div className="settings-column">
<<<<<<< HEAD
=======
          <section className="settings-panel" aria-labelledby="profile-title">
            <div className="settings-panel-heading">
              <div>
                <p className="settings-eyebrow">YOUR ACCOUNT</p>
                <h2 id="profile-title">Profile</h2>
              </div>
            </div>
            {profileLoading ? (
              <p role="status">Loading profile...</p>
            ) : (
              <form className="category-form" onSubmit={saveProfile}>
                <label className="settings-field" htmlFor="profile-name">
                  <span>Full name</span>
                  <input id="profile-name" value={profile.name} onChange={updateProfileField('name')} maxLength={100} required />
                </label>
                <label className="settings-field" htmlFor="profile-email">
                  <span>Email</span>
                  <input id="profile-email" type="email" value={profile.email} onChange={updateProfileField('email')} required />
                </label>
                <label className="settings-field" htmlFor="profile-phone">
                  <span>Phone number</span>
                  <input id="profile-phone" type="tel" value={profile.phone} onChange={updateProfileField('phone')} placeholder="0712 345 678" required />
                </label>
                <button className="button-primary" type="submit" disabled={profileSaving}>
                  {profileSaving ? 'Saving...' : 'Save profile'}
                </button>
                <p className="settings-status" role="status" aria-live="polite">{profileMessage}</p>
              </form>
            )}
          </section>
>>>>>>> fbdf4b6 (complete frontend intergration)
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

<<<<<<< HEAD
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
=======
        <section className="settings-panel auth-panel" aria-labelledby="account-title">
          <div className="settings-panel-heading">
            <div>
              <p className="settings-eyebrow">SIGNED IN AS</p>
              <h2 id="account-title">{user.name}</h2>
            </div>
          </div>
          <p>{user.email}</p>
          <button className="button-danger" type="button" onClick={logout}>Log out</button>
>>>>>>> fbdf4b6 (complete frontend intergration)
        </section>
      </div>
    </div>
  );
}
<<<<<<< HEAD

=======
>>>>>>> fbdf4b6 (complete frontend intergration)
