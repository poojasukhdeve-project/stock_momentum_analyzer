// frontend/src/components/SymbolSearch.jsx
import React, { useState, useEffect } from 'react';

export default function SymbolSearch({ value = '', onChange }) {
  // local controlled input so the user can type before submitting
  const [input, setInput] = useState(value || '');

  // keep local input in sync if parent value changes externally
  useEffect(() => {
    setInput(value || '');
  }, [value]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const s = (input || '').trim();
    if (!s) return;
    // convert to uppercase so backend gets consistent symbols
    const upper = s.toUpperCase();
    if (onChange && upper !== value) onChange(upper);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
      <input
        name="symbol"
        aria-label="Stock symbol"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Symbol e.g. AAPL"
        style={{ padding: '6px 8px', minWidth: 140, borderRadius: 4, border: '1px solid #ccc' }}
      />
      <button
        type="submit"
        disabled={(input || '').trim().length === 0}
        style={{
          padding: '6px 12px',
          borderRadius: 4,
          border: 'none',
          background: '#2b6cb0',
          color: 'white',
          cursor: 'pointer'
        }}
      >
        Analyze
      </button>
    </form>
  );
}
