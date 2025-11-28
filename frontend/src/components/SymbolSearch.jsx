// frontend/src/components/SymbolSearch.jsx
import React, { useState, useEffect } from 'react';

const popular = ['AAPL','MSFT','TSLA','AMZN','GOOGL'];

export default function SymbolSearch({ value = '', onChange }) {
  const [input, setInput] = useState(value || '');

  useEffect(()=> { setInput(value || '') }, [value]);

  function handleSelect(e){
    const s = e.target.value;
    setInput(s);
    if(onChange) onChange(s);
  }
  function handleSubmit(e){
    e.preventDefault();
    const s = (input||'').trim().toUpperCase();
    if(!s) return;
    if(onChange) onChange(s);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display:'flex', gap:8, alignItems:'center' }}>
      <select onChange={handleSelect} value={input||'AAPL'} style={{padding:8}}>
        {popular.map(s=> <option key={s} value={s}>{s}</option>)}
      </select>

      <input value={input} onChange={e=>setInput(e.target.value)}
             placeholder="Symbol e.g. AAPL" style={{padding:8}} />

      <button type="submit" style={{padding:'6px 12px', background:'#2b6cb0', color:'#fff', border:'none', borderRadius:4}}>
        Analyze
      </button>
    </form>
  );
}
