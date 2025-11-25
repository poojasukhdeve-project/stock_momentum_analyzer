// frontend/src/components/MomentumCard.jsx
import React from 'react';

function formatPct(v) {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  return `${(Number(v) * 100).toFixed(2)}%`;
}

function formatNum(v, digits = 2) {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  return Number(v).toFixed(digits);
}

function formatDate(d) {
  if (!d) return '—';
  // try to parse ISO or Date object
  const date = (typeof d === 'string') ? new Date(d) : d;
  if (isNaN(date)) return d;
  return date.toISOString().slice(0, 10);
}

export default function MomentumCard({ summary }) {
  // If summary is explicitly null -> show friendly message
  if (summary === null) {
    return (
      <div style={{
        padding: 12,
        border: '1px solid #ddd',
        marginBottom: 12,
        color: '#666',
        borderRadius: 6,
        background: '#fafafa'
      }}>
        <h3 style={{ margin: '0 0 6px' }}>Summary</h3>
        <div>Summary not available (not enough data).</div>
      </div>
    );
  }

  // If summary is undefined (still loading), show Loading...
  if (!summary) {
    return <div style={{ padding: 12, marginBottom: 12 }}>Loading...</div>;
  }

  // safe reads (use optional chaining)
  const symbol = summary.symbol ?? 'N/A';
  const label = summary.label ?? '';
  const score = (summary.score !== undefined && summary.score !== null) ? formatNum(summary.score, 2) : '—';
  // assume returnPct might be in fraction (0.02 => 2%) or already percent, 
  // your earlier code used .toFixed(2) on returnPct so we keep same assumption:
  const returnPct = summary.returnPct ?? summary.returnPct === 0 ? summary.returnPct : null;
  const startDate = summary.startDate ?? summary.start_date ?? null;
  const endDate = summary.endDate ?? summary.end_date ?? null;

  return (
    <div style={{
      padding: 12,
      border: '1px solid #ddd',
      marginBottom: 12,
      borderRadius: 6,
      background: '#fff',
      boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
    }}>
      <h3 style={{ margin: '0 0 8px' }}>{symbol} {label ? `— ${label}` : ''}</h3>

      <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 12, color: '#666' }}>Score</div>
          <div style={{ fontWeight: 600, fontSize: 18 }}>{score}</div>
        </div>

        <div>
          <div style={{ fontSize: 12, color: '#666' }}>Return</div>
          <div style={{ fontWeight: 600, fontSize: 18 }}>
            { returnPct !== null ? formatPct(returnPct) : '—' }
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, color: '#666' }}>Period</div>
          <div style={{ fontWeight: 500 }}>
            {formatDate(startDate)} → {formatDate(endDate)}
          </div>
        </div>

        {/* optional extra fields if available */}
        {summary.avgGain !== undefined && (
          <div>
            <div style={{ fontSize: 12, color: '#666' }}>Avg Gain</div>
            <div style={{ fontWeight: 600 }}>{formatPct(summary.avgGain)}</div>
          </div>
        )}

        {summary.avgLoss !== undefined && (
          <div>
            <div style={{ fontSize: 12, color: '#666' }}>Avg Loss</div>
            <div style={{ fontWeight: 600 }}>{formatPct(summary.avgLoss)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
