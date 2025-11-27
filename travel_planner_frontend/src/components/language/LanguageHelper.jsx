import React, { useEffect, useMemo, useRef, useState } from 'react';
import phrasesData from './phrases.json';

/**
 * PUBLIC_INTERFACE
 * LanguageHelper
 * A slide-over panel that provides:
 * 1) Quick Phrases organized by category and language.
 * 2) A simple offline Translate helper based on a small dictionary.
 *
 * Props:
 * - open: boolean
 * - onClose: function
 * - defaultTargetLang?: 'en'|'es'|'fr'|'hi'
 *
 * Notes:
 * - Offline translation is a naive dictionary lookup with token fallback.
 * - TODO: Integrate a backend or external translation API (e.g. onTranslate function)
 *   preserving shape and accessibility. Do not require keys here.
 */
function LanguageHelper({ open = false, onClose, defaultTargetLang = 'en' }) {
  const [tab, setTab] = useState('phrases'); // 'phrases' | 'translate'
  const [targetLang, setTargetLang] = useState(defaultTargetLang);
  const [sourceText, setSourceText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [translated, setTranslated] = useState('');

  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    // reset basic state when reopened
    if (open) {
      setTab('phrases');
      setTargetLang(defaultTargetLang);
    }
  }, [open, defaultTargetLang]);

  const languages = phrasesData.languages;
  const categories = phrasesData.categories;
  const phrases = phrasesData.phrases;
  const dictionary = phrasesData.dictionary;

  const categoryIds = useMemo(() => categories.map((c) => c.id), [categories]);

  const doTranslate = () => {
    // Very naive dictionary-driven translation:
    // - Try to match full phrase (lowercase) against all 'keys' in phrases
    // - If not found, tokenize by space and translate known words
    // - Preserve punctuation minimally
    const text = sourceText.trim();
    if (!text) {
      setTranslated('');
      return;
    }
    const lower = text.toLowerCase();

    // 1) Try direct phrase match using 'keys' across categories
    for (const cat of categoryIds) {
      for (const entry of phrases[cat]) {
        if (entry.keys?.some((k) => k === lower)) {
          const out = (entry[targetLang] ?? entry.en ?? text);
          setTranslated(out);
          return;
        }
      }
    }

    // 2) Word-by-word token lookup
    const tokens = lower.split(/(\s+|[.,!?;]+)/g); // keep separators
    const result = tokens.map((tok) => {
      // ignore pure separators
      if (tok.trim().length === 0 || /[.,!?;]+/.test(tok)) return tok;
      const cleaned = tok.replace(/[.,!?;]+/g, '');
      // Try dictionary direct
      const entry = dictionary[cleaned];
      if (entry && entry[targetLang]) return entry[targetLang];

      // Fallback identity
      return tok;
    }).join('');

    // Capitalization heuristic
    const normalized = result.replace(/\s+/g, ' ').trim();
    const pretty = normalized.length > 0
      ? normalized[0].toUpperCase() + normalized.slice(1)
      : '';
    setTranslated(pretty);
  };

  const copyText = async (txt) => {
    try {
      await navigator.clipboard.writeText(txt);
      alert('Copied to clipboard');
    } catch {
      // ignore
    }
  };

  if (!open) return null;

  return (
    <aside
      ref={panelRef}
      aria-label="Language assistance panel"
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
        zIndex: 45
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <div>
          <h3 className="trips-title" style={{ margin: 0 }}>Language Assistant</h3>
          <p className="trips-subtitle" style={{ margin: 0 }}>Quick phrases and simple translation</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn-secondary" onClick={onClose} title="Close language helper">Close</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setTab('phrases')}
          style={tab === 'phrases' ? { background: 'rgba(37, 99, 235, 0.06)' } : undefined}
        >
          Quick Phrases
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setTab('translate')}
          style={tab === 'translate' ? { background: 'rgba(37, 99, 235, 0.06)' } : undefined}
        >
          Translate
        </button>
      </div>

      {tab === 'phrases' ? (
        <section>
          <div className="builder-form" style={{ marginBottom: 12 }}>
            <div className="grid-2">
              <div className="field-row">
                <label htmlFor="lang-select">Target language</label>
                <select
                  id="lang-select"
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                >
                  {languages.map((l) => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div className="field-row">
                <label>Tip</label>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Tap a phrase to copy it. Show your screen or play it aloud.
                </div>
              </div>
            </div>
          </div>

          {categories.map((cat) => (
            <div key={cat.id} className="builder-form" style={{ marginBottom: 12 }}>
              <div className="days-header" style={{ marginBottom: 8 }}>
                <h4 className="day-title" style={{ margin: 0 }}>{cat.label}</h4>
              </div>
              <ul className="days-list">
                {phrases[cat.id].map((entry, idx) => {
                  const toShow = entry[targetLang] ?? entry.en;
                  const base = entry.en;
                  return (
                    <li key={`${cat.id}-${idx}`} className="activity-item">
                      <div className="activity-main">
                        <div className="activity-info">
                          <div className="activity-title">{toShow}</div>
                          <div className="activity-sub">
                            <span className="pill">{languages.find(l => l.code === targetLang)?.name}</span>
                            <span className="muted"> • EN: {base}</span>
                          </div>
                        </div>
                      </div>
                      <div className="activity-actions">
                        <button
                          type="button"
                          className="btn-secondary small"
                          onClick={() => copyText(toShow)}
                          title="Copy phrase"
                        >
                          Copy
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </section>
      ) : (
        <section>
          <div className="builder-form" style={{ marginBottom: 12 }}>
            <div className="grid-2">
              <div className="field-row">
                <label htmlFor="src-lang">From</label>
                <select id="src-lang" value={sourceLang} onChange={(e) => setSourceLang(e.target.value)}>
                  {languages.map((l) => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div className="field-row">
                <label htmlFor="dst-lang">To</label>
                <select id="dst-lang" value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
                  {languages.map((l) => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field-row" style={{ marginTop: 8 }}>
              <label htmlFor="src-text">Text</label>
              <textarea
                id="src-text"
                rows={3}
                placeholder="Enter text (e.g., Thank you)"
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
              />
            </div>
            <div className="form-actions" style={{ marginTop: 8 }}>
              <button type="button" className="btn-secondary" onClick={() => setSourceText('')}>
                Clear
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={doTranslate}
                disabled={!sourceText.trim()}
                title="Translate using offline dictionary"
              >
                Translate
              </button>
            </div>
          </div>

          <div className="days-wrap" style={{ marginBottom: 12 }}>
            <div className="days-header">
              <h4 className="day-title" style={{ margin: 0 }}>Result</h4>
              <div>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => copyText(translated)}
                  disabled={!translated}
                  title="Copy result"
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="trips-empty" style={{ background: 'var(--surface)' }}>
              {translated ? translated : 'Translation will appear here.'}
            </div>
          </div>

          <div className="trips-empty" style={{ background: 'rgba(37,99,235,0.04)', borderStyle: 'dashed' }}>
            TODO: Replace offline translation with a backend or external API.
            Provide an async translate(text, from, to) here and wire to a service.
          </div>
        </section>
      )}
    </aside>
  );
}

export default LanguageHelper;
