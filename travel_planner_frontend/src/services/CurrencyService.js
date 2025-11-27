//
// CurrencyService: lightweight FX conversion with static fallback rates.
// - Provides a curated list of common currencies.
// - Converts amounts using base USD with a static rates table.
// - Persists last-used selections in localStorage.
// - TODOs left to wire with backend or public FX API later (no keys required).
//

const STORAGE_KEY = 'currency_prefs';

// Curated common currencies
export const COMMON_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'INR', 'CNY', 'KRW', 'SGD', 'THB', 'AED', 'ZAR',
];

// Static fallback rates relative to USD.
// Sources: approximate market values; acceptable for offline demo. Not real-time.
// TODO: Replace with backend-provided or public API rates when available.
const STATIC_RATES_USD = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 155.0,
  AUD: 1.50,
  CAD: 1.36,
  INR: 83.0,
  CNY: 7.25,
  KRW: 1350.0,
  SGD: 1.34,
  THB: 35.7,
  AED: 3.67,
  ZAR: 18.0,
};

// PUBLIC_INTERFACE
export const CurrencyService = (() => {
  /**
   * Get list of supported currency codes.
   */
  function getSupportedCurrencies() {
    return COMMON_CURRENCIES.slice();
  }

  /**
   * Get a friendly currency label.
   * Example: "USD — US Dollar"
   * For now, provide a minimal mapping. Expand later as needed.
   */
  function getLabel(code) {
    const names = {
      USD: 'US Dollar',
      EUR: 'Euro',
      GBP: 'British Pound',
      JPY: 'Japanese Yen',
      AUD: 'Australian Dollar',
      CAD: 'Canadian Dollar',
      INR: 'Indian Rupee',
      CNY: 'Chinese Yuan',
      KRW: 'South Korean Won',
      SGD: 'Singapore Dollar',
      THB: 'Thai Baht',
      AED: 'UAE Dirham',
      ZAR: 'South African Rand',
    };
    return `${code} — ${names[code] || code}`;
  }

  /**
   * Load persisted preferences.
   * Returns { from: string, to: string } or defaults.
   */
  function loadPrefs() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const obj = JSON.parse(raw || '{}');
      const from = typeof obj.from === 'string' ? obj.from : 'USD';
      const to = typeof obj.to === 'string' ? obj.to : 'EUR';
      return { from, to };
    } catch {
      return { from: 'USD', to: 'EUR' };
    }
  }

  /**
   * Save preferences.
   */
  function savePrefs({ from, to }) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ from, to }));
    } catch {
      // ignore
    }
  }

  /**
   * Convert an amount between two currency codes using rates relative to USD.
   * Returns a number (NaN if invalid).
   */
  // PUBLIC_INTERFACE
  function convert(amount, fromCode, toCode, rates = STATIC_RATES_USD) {
    const amt = Number(amount);
    const from = String(fromCode || '').toUpperCase();
    const to = String(toCode || '').toUpperCase();
    if (!Number.isFinite(amt)) return NaN;
    if (!(from in rates) || !(to in rates)) return NaN;
    if (from === to) return amt;

    // Convert to USD, then to target
    const inUsd = amt / rates[from];
    const out = inUsd * rates[to];
    return out;
  }

  /**
   * Fetch latest rates.
   * For now returns the STATIC_RATES_USD immediately.
   * TODO: Wire to backend or a public API (without requiring API keys in client).
   */
  // PUBLIC_INTERFACE
  async function getRates() {
    // Example future flow:
    // const resp = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/fx/rates`);
    // const data = await resp.json();
    // return data.rates;
    return { ...STATIC_RATES_USD, _source: 'static', _ts: Date.now() };
  }

  return {
    getSupportedCurrencies,
    getLabel,
    loadPrefs,
    savePrefs,
    convert,
    getRates,
  };
})();
