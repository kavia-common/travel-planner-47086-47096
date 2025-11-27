import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Toasts
 * Renders a list of inline themed toasts at the top-right corner.
 */
function Toasts({ items = [], onDismiss }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        display: 'grid',
        gap: 8,
        zIndex: 50,
      }}
    >
      {items.map((t) => (
        <div
          key={t.id}
          role="status"
          className="toast-card"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-color)',
            borderLeft: '4px solid var(--primary)',
            borderRadius: 12,
            boxShadow: 'var(--shadow)',
            padding: '10px 12px',
            minWidth: 260,
            color: 'var(--text)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>
                {t.prefix ? `${t.prefix} ` : ''}{t.title}
              </div>
              {t.subtitle ? (
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t.subtitle}</div>
              ) : null}
            </div>
            <button
              type="button"
              className="btn-secondary small"
              onClick={() => onDismiss?.(t.id)}
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Toasts;
