import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [notice, setNotice] = useState(null);

  const dismiss = useCallback(() => setNotice(null), []);
  const showToast = useCallback((message, variant = 'error') => {
    setNotice({ message, variant });
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(dismiss, 5000);
    return () => window.clearTimeout(timeout);
  }, [dismiss, notice]);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {notice && (
        <div
          className={`toast toast-${notice.variant}`}
          role={notice.variant === 'error' ? 'alert' : 'status'}
          aria-live={notice.variant === 'error' ? 'assertive' : 'polite'}
        >
          <span>{notice.message}</span>
          <button type="button" onClick={dismiss} aria-label="Dismiss notification">×</button>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const showToast = useContext(ToastContext);
  if (!showToast) throw new Error('useToast must be used within a ToastProvider');
  return showToast;
}
