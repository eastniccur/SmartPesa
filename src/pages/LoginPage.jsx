import { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const emptyForm = { name: '', email: '', phone: '', password: '' };
const networkMessage =
  'Cannot reach the server. Check your connection and try again. If the site was idle, wait a minute while it wakes up.';

function validateForm(view, form) {
  const errors = {};
  const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

  if (view === 'register' && !form.name.trim()) {
    errors.name = 'Enter your full name.';
  }
  if (!form.email.trim()) {
    errors.email = 'Enter your email address.';
  } else if (!emailPattern.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if ((view === 'register' || view === 'forgot') && !form.phone.trim()) {
    errors.phone = 'Enter your phone number.';
  }
  if (!form.password) {
    errors.password = 'Enter your password.';
  } else if ((view === 'register' || view === 'forgot') && form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  return errors;
}

export function LoginPage() {
  const { user, login } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();
  const [view, setView] = useState('login');
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [fieldErrorCodes, setFieldErrorCodes] = useState({});
  const [formError, setFormError] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const busyRef = useRef(false);
  const inputRefs = useRef({});

  if (user) return <Navigate to="/" replace />;

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
    setFieldErrorCodes((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
    setFormError('');
    setStatus('');
  };

  function switchView(next, { preserveEmail = false, successStatus = '' } = {}) {
    const email = preserveEmail ? form.email : '';
    setView(next);
    setForm({ ...emptyForm, email });
    setFieldErrors({});
    setFieldErrorCodes({});
    setFormError('');
    setStatus(successStatus);
    setShowPassword(false);
  }

  function handleFailure(err) {
    const code = err.code;
    if (code === 'network') {
      setFormError(networkMessage);
      return;
    }
    if (err.status === 500) {
      setFormError(err.message);
      return;
    }

    const fieldForCode = {
      email_not_found: 'email',
      invalid_email: 'email',
      email_taken: 'email',
      wrong_password: 'password',
      weak_password: 'password',
      phone_taken: 'phone',
      invalid_phone: 'phone',
      phone_mismatch: 'phone',
      invalid_name: 'name',
    };

    if (code === 'missing_fields') {
      setFieldErrors({
        email: err.message,
        password: err.message,
      });
      return;
    }

    const field = fieldForCode[code];
    if (field) {
      setFieldErrors({ [field]: err.message });
      setFieldErrorCodes({ [field]: code });
      return;
    }

    setFormError(err.message);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (busyRef.current) return;

    const errors = validateForm(view, form);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setFieldErrorCodes({});
      setFormError('');
      const fieldOrder = view === 'register'
        ? ['name', 'phone', 'email', 'password']
        : view === 'forgot' ? ['email', 'phone', 'password'] : ['email', 'password'];
      const firstInvalidField = fieldOrder.find((field) => errors[field]);
      inputRefs.current[firstInvalidField]?.focus();
      return;
    }

    busyRef.current = true;
    setBusy(true);
    setFieldErrors({});
    setFieldErrorCodes({});
    setFormError('');
    setStatus('');

    try {
      if (view === 'forgot') {
        await api('/api/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify({
            email: form.email,
            phone: form.phone,
            new_password: form.password,
          }),
        });
        switchView('login', {
          preserveEmail: true,
          successStatus: 'Password updated. Log in with your new password.',
        });
        return;
      }

      const submittedView = view;
      const data = submittedView === 'login'
        ? await api('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: form.email, password: form.password }),
          })
        : await api('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(form),
          });
      login(data.user);
      showToast(submittedView === 'login' ? `Welcome back, ${data.user.name}` : 'Account created', 'success');
      navigate('/', { replace: true });
    } catch (err) {
      handleFailure(err);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  function renderFieldError(field) {
    if (!fieldErrors[field]) return null;

    return (
      <p className="field-error" id={`auth-${field}-error`} role="alert">
        {fieldErrors[field]}
        {field === 'email' && fieldErrorCodes[field] === 'email_taken' && (
          <>
            {' '}
            <button
              className="auth-inline-action"
              type="button"
              onClick={() => switchView('login', { preserveEmail: true })}
            >
              Go to login
            </button>
          </>
        )}
        {field === 'email' && fieldErrorCodes[field] === 'email_not_found' && view === 'login' && (
          <>
            {' '}
            <button
              className="auth-inline-action"
              type="button"
              onClick={() => switchView('register', { preserveEmail: true })}
            >
              Create an account
            </button>
          </>
        )}
      </p>
    );
  }

  function renderTextField(field, label, options = {}) {
    const { type = 'text', autoComplete, placeholder, maxLength } = options;
    const errorId = fieldErrors[field] ? `auth-${field}-error` : undefined;

    return (
      <div className="auth-field">
        <label className="settings-field" htmlFor={`auth-${field}`}>
          <span>{label}</span>
          <input
            id={`auth-${field}`}
            ref={(element) => { inputRefs.current[field] = element; }}
            type={type}
            autoComplete={autoComplete}
            placeholder={placeholder}
            maxLength={maxLength}
            value={form[field]}
            onChange={update(field)}
            aria-invalid={Boolean(fieldErrors[field])}
            aria-describedby={errorId}
          />
        </label>
        {renderFieldError(field)}
      </div>
    );
  }

  function renderPasswordField() {
    const errorId = fieldErrors.password ? 'auth-password-error' : undefined;

    return (
      <div className="auth-field">
        <div className="settings-field">
          <label htmlFor="auth-password">
            <span>{view === 'login' ? 'Password' : 'New password (8+ characters)'}</span>
          </label>
          <div className="auth-password-control">
            <input
              id="auth-password"
              ref={(element) => { inputRefs.current.password = element; }}
              type={showPassword ? 'text' : 'password'}
              autoComplete={view === 'login' ? 'current-password' : 'new-password'}
              value={form.password}
              onChange={update('password')}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={errorId}
            />
            <button
              className="auth-password-toggle"
              type="button"
              aria-pressed={showPassword}
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? 'Hide password' : 'Show password'}
            </button>
          </div>
        </div>
        {renderFieldError('password')}
      </div>
    );
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
        {view !== 'forgot' && (
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
        )}
        <form
          className="auth-form"
          id="auth-form-panel"
          role={view === 'forgot' ? undefined : 'tabpanel'}
          aria-labelledby={view === 'forgot' ? undefined : `${view}-tab`}
          noValidate
          onSubmit={handleSubmit}
        >
          {view === 'register' && (
            <>
              {renderTextField('name', 'Full name', { maxLength: 100 })}
              {renderTextField('phone', 'Phone number', { type: 'tel', autoComplete: 'tel', placeholder: '0712 345 678' })}
            </>
          )}
          {renderTextField('email', 'Email', { type: 'email', autoComplete: 'email' })}
          {view === 'forgot' && (
            renderTextField('phone', 'Phone number', { type: 'tel', autoComplete: 'tel', placeholder: '0712 345 678' })
          )}
          {renderPasswordField()}
          {view === 'login' && (
            <button
              className="auth-link"
              type="button"
              onClick={() => switchView('forgot')}
            >
              Forgot password?
            </button>
          )}
          {view === 'forgot' && (
            <button
              className="auth-link"
              type="button"
              onClick={() => switchView('login', { preserveEmail: true })}
            >
              Back to login
            </button>
          )}
          {formError && <p className="auth-form-error" role="alert">{formError}</p>}
          <button className="button-primary auth-submit" type="submit" disabled={busy}>
            {busy ? 'Please wait...' : view === 'login' ? 'Login' : view === 'register' ? 'Create account' : 'Reset password'}
          </button>
          <p className="settings-status" role="status" aria-live="polite">{status}</p>
        </form>
      </section>
    </div>
  );
}
