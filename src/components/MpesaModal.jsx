import { useState } from "react";
import "../styles/theme.css";

export default function MpesaModal({
  isOpen,
  onClose,
  onSubmit,
}) {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const numericAmount = Number(amount);
    const normalizedPhone = phone.replace(/[\s-]/g, "");

    if (!/^(\+?254|0)7\d{8}$/.test(normalizedPhone)) {
      setError("Enter a valid Kenyan mobile number.");
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter a valid payment amount.");
      return;
    }

    if (typeof onSubmit !== "function") {
      setError("M-Pesa payment is not connected yet.");
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        phone_number: normalizedPhone,
        amount: Math.round(numericAmount),
      });

      setMessage("Payment request submitted. Check your phone.");
      setPhone("");
      setAmount("");
    } catch (err) {
      setError(err.message || "Unable to start M-Pesa payment.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) return;

    setError("");
    setMessage("");
    onClose?.();
  }

  return (
    <div
      className="mpesa-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <section
        className="mpesa-modal form-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mpesa-title"
      >
        <div className="mpesa-header">
          <div>
            <h2 id="mpesa-title">Pay with M-Pesa</h2>
            <p>Enter your phone number and payment amount.</p>
          </div>

          <button
            type="button"
            className="mpesa-close"
            onClick={handleClose}
            disabled={loading}
            aria-label="Close payment form"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="mpesa-phone">M-Pesa phone number</label>
            <input
              id="mpesa-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="0712345678"
              autoComplete="tel"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="mpesa-amount">Amount (KES)</label>
            <input
              id="mpesa-amount"
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="e.g. 500"
              required
            />
          </div>

          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className="success-message" role="status">
              {message}
            </p>
          )}

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Sending request..." : "Request Payment"}
            </button>

            <button
              type="button"
              className="mpesa-cancel"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}