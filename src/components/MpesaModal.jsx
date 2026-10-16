import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { toCents } from '../utils/money';
import { useAuth } from '../context/AuthContext';

const POLL_MS = 2000;
const MAX_POLLS = 30; // 30 x 2s = 60 seconds
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const emptyForm = { phone: '', amount: '', description: '', budget_id: '' };

export function MpesaModal({ open, onClose, budgets = [], onCompleted }) {
  const { user } = useAuth();
  const userId = user.id;
  const [form, setForm] = useState(emptyForm);
  const [phase, setPhase] = useState('form'); // form | sending | waiting | failed
  const [message, setMessage] = useState('');
  const activeRef = useRef(false);

  useEffect(() => {
    if (open) {
      setForm(emptyForm);
      setPhase('form');
      setMessage('');
    }
    // Closing the modal (or leaving the page) stops any polling loop
    return () => { activeRef.current = false; };
  }, [open]);

  if (!open) return null;

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  function finish() {
    activeRef.current = false;
    onCompleted();
    onClose();
  }

  function fail(text) {
    activeRef.current = false;
    setPhase('failed');
    setMessage(text);
  }

  async function submit(event) {
    event.preventDefault();
    const shillings = Number(form.amount);
    if (!Number.isInteger(shillings) || shillings < 1) {
      setMessage('Enter a whole-shilling amount of at least 1.');
      return;
    }

    setPhase('sending');
    setMessage('');
    activeRef.current = true;

    try {
      const body = {
        user_id: userId,
        amount_cents: toCents(shillings),
        description: form.description.trim() || 'M-Pesa payment',
      };
      if (form.phone.trim()) body.phone = form.phone.trim();
      if (form.budget_id) body.budget_id = Number(form.budget_id);

      const data = await api('/api/mpesa/stkpush', { method: 'POST', body: JSON.stringify(body) });

      // Simulate mode answers immediately; real Daraja answers "pending"
      if (data.status === 'completed') return finish();
      if (data.status !== 'pending') {
        return fail(data.result?.message || 'The payment was not completed.');
      }

      setPhase('waiting');
      for (let i = 0; i < MAX_POLLS; i += 1) {
        await sleep(POLL_MS);
        if (!activeRef.current) return; // modal was closed
        const result = await api(`/api/mpesa/status/${data.checkout_request_id}`);
        if (result.status === 'completed') return finish();
        if (result.status === 'failed') {
          return fail(result.message || 'The payment was cancelled or failed.');
        }
      }
      fail('Timed out waiting for the payment. Check your phone, then the transaction list.');
    } catch (err) {
      fail(err.message);
    }
  }

  const busy = phase === 'sending' || phase === 'waiting';

  return (
    <div className="mpesa-overlay" role="presentation">
      <div className="mpesa-modal" role="dialog" aria-modal="true" aria-labelledby="mpesa-title">
        <h2 id="mpesa-title">Pay with M-Pesa</h2>

        {phase === 'waiting' ? (
          <p role="status">Check your phone and enter your M-Pesa PIN. Waiting for confirmation...</p>
        ) : phase === 'sending' ? (
          <p role="status">Sending the payment request...</p>
        ) : (
          <form onSubmit={submit}>
            <label>Phone number
              <input name="phone" type="tel" value={form.phone} onChange={update}
                placeholder="0712 345 678 (blank uses your profile)" />
            </label>
            <label>Amount (whole KES)
              <input name="amount" type="number" min="1" step="1" value={form.amount}
                onChange={update} placeholder="100" required />
            </label>
            <label>Description
              <input name="description" value={form.description} onChange={update}
                placeholder="e.g. Naivas shopping" maxLength={200} />
            </label>
            <label>Budget category
              <select name="budget_id" value={form.budget_id} onChange={update}>
                <option value="">No budget (uncategorized)</option>
                {budgets.map((b) => <option key={b.id} value={b.id}>{b.category}</option>)}
              </select>
            </label>
            {message && <p className="mpesa-error" role="alert">{message}</p>}
            <div className="mpesa-modal-actions">
              <button className="transactions-clear" type="button" onClick={onClose}>Cancel</button>
              <button className="button-primary" type="submit">
                {phase === 'failed' ? 'Try again' : 'Send payment request'}
              </button>
            </div>
          </form>
        )}

        {phase === 'failed' && <p className="mpesa-error" role="alert">{message}</p>}

        {busy && (
          <div className="mpesa-modal-actions">
            <button className="transactions-clear" type="button" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}