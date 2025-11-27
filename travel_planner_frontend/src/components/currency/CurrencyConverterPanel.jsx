import React, { useEffect, useMemo, useState } from 'react';
import CurrencySelector from './CurrencySelector';
import { CurrencyService } from '../../services/CurrencyService';

/**
 * PUBLIC_INTERFACE
 * CurrencyConverterPanel
 * Modal-like slide-over panel to convert currencies.
 *
 * Props:
 * - open: boolean
 * - onClose: function
 *
 * Features:
 * - Amount input with numeric validation
 * - From/To currency selectors (curated list)
 * - Swap action
 * - Shows computed result with basic formatting
 * - Reverse conversion helper (optional)
 * - Persists last selection in localStorage
 * - Offline static rates with a Refresh placeholder (TODO wire to backend API)
 */
function CurrencyConverterPanel({ open = false, onClose }) {
  const persisted = CurrencyService.loadPrefs();

  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState(persisted.from || 'USD');
  const [to, setTo] = useState(persisted.to || 'EUR');
  const [rates, setRates] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    // Load rates when opened
    let cancelled = false;
    (async () => {
      try {
        const r = await CurrencyService.getRates();
        if (!cancelled) setRates(r);
      } catch {
        if (!cancelled) setRates(null);
      }
    })();
    return () => { cancelled = true; };
  }, [open]);

  // Persist selection on change
  useEffect(() => {
    CurrencyService.savePrefs({ from, to });
  }, [from, to]);

  const numericAmount = useMemo(() => {
    const trimmed = String(amount).trim();
    if (trimmed === '') return NaN;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : NaN;
  }, [amount]);

  const result = useMemo(() => {
    if (!rates) return null;
    const out = CurrencyService.convert(numericAmount, from, to, rates);
    return Number.isFinite(out) ? out : null;
  }, [numericAmount, from, to, rates]);

  const reverse = useMemo(() => {
    if (!rates) return null;
    if (!result || !Number.isFinite(result)) return null;
    const back = CurrencyService.convert(result, to, from, rates);
    return Number.isFinite(back) ? back : null;
  }, [result, from, to, rates]);

  useEffect(() => {
    // Basic validation for amount
    if (String(amount).trim() === '') {
      setError('Enter an amount');
    } else if (!Number.isFinite(numericAmount)) {
      setError('Amount must be a number');
    } else if (numericAmount < 0) {
      setError('Amount cannot be negative');
    } else {
      setError('');
    }
  }, [amount, numericAmount]);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const refreshRates = async () => {
    // Placeholder: reload the (static) rates and timestamp.
    // TODO: Replace with live refresh when backend/public API is available.
    const r = await CurrencyService.getRates();
    setRates(r);
  };

  if (!open) return null;

  const format = (val, code) => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: code,
        maximumFractionDigits: 4,
      }).format(val);
    } catch {
      // Fallback formatting
      return `${code} ${Number(val).toFixed(2)}`;
    }
  };

  const ts = rates && rates._ts ? new Date(rates._ts).toLocaleString() : '—';
  const source = rates && rates._source ? String(rates._source) : 'unknown';

  return (
    <aside
      aria-label="Currency converter panel"
      style={{
        position: 'fixed',
        right: 16,
        top: 80,
        bottom: 16,
        width: 'min(520px, 94vw)',
        background: 'var(--surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 14,
        boxShadow: 'var(--shadow)',
        padding: 16,
        overflow: 'auto',
        zIndex: 44,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <div>
          <h3 className="trips-title" style={{ margin: 0 }}>Currency Converter</h3>
          <p className="trips-subtitle" style={{ margin: 0 }}>
            Convert between popular currencies (offline friendly)
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn-secondary" onClick={refreshRates} title="Refresh rates (placeholder)">
            Refresh
          </button>
          <button type="button" className="btn-secondary" onClick={onClose} title="Close panel">
            Close
          </button>
        </div>
      </div>

      <div className="builder-form" style={{ marginBottom: 12 }}>
        <div className="field-row">
          <label htmlFor="cc-amount">Amount</label>
          <input
            id="cc-amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {error ? <div style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{error}</div> : null}
        </div>

        <div className="grid-2" style={{ alignItems: 'end' }}>
          <CurrencySelector id="cc-from" label="From" value={from} onChange={setFrom} />
          <CurrencySelector id="cc-to" label="To" value={to} onChange={setTo} />
        </div>

        <div className="form-actions" style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          <button type="button" className="btn-secondary" onClick={swap} title="Swap currencies">
            ⇄ Swap
          </button>
        </div>
      </div>

      <div className="days-wrap" style={{ marginBottom: 12 }}>
        <div className="days-header">
          <h4 className="day-title" style={{ margin: 0 }}>Result</h4>
        </div>
        <div className="trips-empty" style={{ background: 'var(--surface)' }}>
          {rates == null ? (
            <span>Loading rates…</span>
          ) : error ? (
            <span>Fix input to see the result.</span>
          ) : result != null ? (
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>
                {format(result, to)}
              </div>
              <div className="trips-subtitle">
                {format(numericAmount || 0, from)} → {to}
              </div>
            </div>
          ) : (
            <span>Enter a valid amount.</span>
          )}
        </div>
      </div>

      <div className="builder-form" style={{ marginBottom: 12 }}>
        <div className="days-header" style={{ marginBottom: 8 }}>
          <h4 className="day-title" style={{ margin: 0 }}>Reverse Check</h4>
        </div>
        <div className="trips-empty" style={{ background: 'var(--surface)' }}>
          {reverse != null ? (
            <div className="trips-subtitle">
              {format(result || 0, to)} back to {from}: {format(reverse, from)}
            </div>
          ) : (
            <div className="trips-subtitle">Reverse conversion will appear here.</div>
          )}
        </div>
      </div>

      <div className="trips-empty" style={{ background: 'rgba(37,99,235,0.04)', borderStyle: 'dashed' }}>
        TODO: Replace static rates with live rates via a backend endpoint or a public FX API.
        Do not require API keys here; add a server proxy if needed. Consider:
        - GET /api/fx/rates (server fetches and caches)
        - Optional base selection and timestamp display
      </div>

      <div className="trips-subtitle" style={{ marginTop: 8 }}>
        Rates source: {source}; Updated: {ts}
      </div>
    </aside>
  );
}

export default CurrencyConverterPanel;
