import React from 'react';
import { CurrencyService } from '../../services/CurrencyService';

/**
 * PUBLIC_INTERFACE
 * CurrencySelector
 * Dropdown for selecting a currency code from the curated list.
 *
 * Props:
 * - value: string (selected currency code)
 * - onChange: function(newCode: string)
 * - label?: string
 * - id?: string
 */
function CurrencySelector({ value, onChange, label = 'Currency', id }) {
  const options = CurrencyService.getSupportedCurrencies();

  return (
    <div className="field-row">
      <label htmlFor={id || 'currency-select'}>{label}</label>
      <select
        id={id || 'currency-select'}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      >
        {options.map((code) => (
          <option key={code} value={code}>
            {CurrencyService.getLabel(code)}
          </option>
        ))}
      </select>
    </div>
  );
}

export default CurrencySelector;
