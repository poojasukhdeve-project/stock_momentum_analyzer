export default function SymbolSearch({value, onChange}){
  const handleSubmit = (e)=>{ e.preventDefault(); const s=e.target.symbol.value.trim(); if(s) onChange(s.toUpperCase()); }
  return (
    <form onSubmit={handleSubmit} style={{display:'flex',gap:8, marginBottom:12}}>
      <input name="symbol" defaultValue={value} placeholder="Symbol e.g. AAPL" />
      <button type="submit">Analyze</button>
    </form>
  );
}
