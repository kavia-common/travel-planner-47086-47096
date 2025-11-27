import React from 'react';

/**
 * PUBLIC_INTERFACE
 * LanguageHelperLauncher
 * Small reusable button to open the LanguageHelper panel.
 *
 * Props:
 * - onOpen: function
 * - label?: string
 */
function LanguageHelperLauncher({ onOpen, label = 'Language' }) {
  return (
    <button
      type="button"
      className="btn-secondary"
      onClick={onOpen}
      title="Open Language Assistant"
      aria-label="Open Language Assistant"
    >
      🌐 {label}
    </button>
  );
}

export default LanguageHelperLauncher;
