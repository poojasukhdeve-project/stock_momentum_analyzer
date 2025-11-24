export default function MomentumCard({summary}){
  if(!summary) return <div>Loading...</div>;
  return (
    <div style={{padding:12, border:'1px solid #ddd', marginBottom:12}}>
      <h3>{summary.symbol} — {summary.label}</h3>
      <p>Score: {summary.score} | Return: {summary.returnPct.toFixed(2)}%</p>
      <p>{summary.startDate} → {summary.endDate}</p>
    </div>
  );
}
