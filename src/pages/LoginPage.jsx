import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';


const emptyForm = { name: '', email: '', phone: '', password: '' };

export function LoginPage() {
  const { user, login } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();
  const [view, setView] = useState('login');
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  if (user) return <Navigate to="/" replace />;

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  function switchView(next) {
    setView(next);
    setForm(emptyForm);
    setMessage('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const data = view === 'login'
        ? await api('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: form.email, password: form.password }),
          })
        : await api('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(form),
          });
      login(data.user);
      showToast(view === 'login' ? `Welcome back, ${data.user.name}` : 'Account created', 'success');
      navigate('/', { replace: true });
    } catch (err) {
      setMessage(err.message);
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="settings-page auth-page">
      <section className="settings-panel auth-panel" aria-labelledby="auth-title">
        <div className="settings-panel-heading">
          <div>
            <p className="settings-eyebrow">SECURE ACCESS</p>
            <h2 id="auth-title">Welcome to SmartPesa</h2>
          </div>
        </div>
        <div className="auth-tabs" role="tablist" aria-label="Account access">
          <button
            className={view === 'login' ? 'auth-tab is-active' : 'auth-tab'}
            id="login-tab" type="button" role="tab"
            aria-selected={view === 'login'} aria-controls="auth-form-panel"
            onClick={() => switchView('login')}
          >
            Login
          </button>
          <button
            className={view === 'register' ? 'auth-tab is-active' : 'auth-tab'}
            id="register-tab" type="button" role="tab"
            aria-selected={view === 'register'} aria-controls="auth-form-panel"
            onClick={() => switchView('register')}
          >
            Register
          </button>
        </div>
        <form
          className="auth-form" id="auth-form-panel" role="tabpanel"
          aria-labelledby={`${view}-tab`} onSubmit={handleSubmit}
        >
          {view === 'register' && (
            <>
              <label className="settings-field" htmlFor="auth-name">
                <span>Full name</span>
                <input id="auth-name" value={form.name} onChange={update('name')} maxLength={100} required />
              </label>
              <label className="settings-field" htmlFor="auth-phone">
                <span>Phone number</span>
                <input id="auth-phone" type="tel" autoComplete="tel" placeholder="0712 345 678"
                  value={form.phone} onChange={update('phone')} required />
              </label>
            </>
          )}
          <label className="settings-field" htmlFor="auth-email">
            <span>Email</span>
            <input id="auth-email" type="email" autoComplete="email"
              value={form.email} onChange={update('email')} required />
          </label>
          <label className="settings-field" htmlFor="auth-password">
            <span>Password (8+ characters)</span>
            <input id="auth-password" type="password" minLength={8}
              autoComplete={view === 'login' ? 'current-password' : 'new-password'}
              value={form.password} onChange={update('password')} required />
          </label>
          <button className="button-primary auth-submit" type="submit" disabled={busy}>
            {busy ? 'Please wait...' : view === 'login' ? 'Login' : 'Create account'}
          </button>
          <p className="settings-status" role="status" aria-live="polite">{message}</p>
        </form>
      </section>
    </div>
  );
}