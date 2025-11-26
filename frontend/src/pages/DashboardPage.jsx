import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import SymbolSearch from '../components/SymbolSearch';
import PriceChart from '../components/PriceChart';
import MomentumCard from '../components/MomentumCard';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export default function DashboardPage({ selectedSymbol, onSymbolChange }) {
  // allow parent-controlled symbol but fall back to a local default
  const [localSymbol, setLocalSymbol] = useState(selectedSymbol || 'AAPL');
  useEffect(() => { if (selectedSymbol) setLocalSymbol(selectedSymbol); }, [selectedSymbol]);

  // range controls (days)
  const [range, setRange] = useState(90);
  const [candles, setCandles] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // helper to change symbol from child component
  function handleSymbolChange(s) {
    setLocalSymbol(s);
    if (typeof onSymbolChange === 'function') onSymbolChange(s);
  }

  useEffect(() => {
    let mounted = true;
    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        const candlesRes = await axios.get(`${API}/api/stocks/${localSymbol}`);
        // request summary with the selected range
        const summaryRes = await axios.get(`${API}/api/stocks/${localSymbol}/summary?range=${range}`);
        if (!mounted) return;
        setCandles(Array.isArray(candlesRes.data) ? candlesRes.data : []);
        setSummary(summaryRes.data || null);
      } catch (e) {
        console.error(e);
        if (!mounted) return;
        setCandles([]);
        setSummary(null);
        setError('Failed to load data — check backend or symbol');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    // only fetch when symbol is set
    if (localSymbol) fetchAll();
    return () => { mounted = false; };
  }, [localSymbol, range]);

  // small transformation for the chart (avoid re-compute on every render)
  const chartData = useMemo(() => {
    return (candles || []).map(c => ({
      date: c.date ? c.date.slice(0,10) : null,
      open: c.open, high: c.high, low: c.low, close: c.close, volume: c.volume
    }));
  }, [candles]);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Stock Momentum Analyzer</h1>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ fontSize: 13, color: '#555' }}>Range:</div>
          {[30, 90, 180, 365].map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: range === r ? '2px solid #2b6cb0' : '1px solid #ddd',
                background: range === r ? '#eef6ff' : 'white',
                cursor: 'pointer'
              }}
            >{r}d</button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ flex: '0 0 380px' }}>
          <SymbolSearch value={localSymbol} onChange={handleSymbolChange} />

          {/* summary card */}
          {loading ? (
            <div style={{ marginTop: 12, color: '#666' }}>Loading summary…</div>
          ) : summary === null ? (
            <div style={{ marginTop: 12, color: '#666' }}>Summary not available (not enough data).</div>
          ) : (
            <div style={{ marginTop: 12 }}>
              <MomentumCard summary={summary} />
            </div>
          )}

          {error && <div style={{ marginTop: 12, color: 'crimson' }}>{error}</div>}

          {/* quick indicators list */}
          <div style={{ marginTop: 18, padding: 12, border: '1px solid #eee', borderRadius: 8, background: '#fff' }}>
            <h4 style={{ margin: '0 0 8px 0' }}>Quick indicators</h4>
            <div style={{ fontSize: 13, color: '#444' }}>
              <div>• SMA20: {summary && summary.sma20 ? summary.sma20.toFixed(2) : '—'}</div>
              <div>• EMA20: {summary && summary.ema20 ? summary.ema20.toFixed(2) : '—'}</div>
              <div>• RSI14: {summary && summary.rsi14 ? summary.rsi14.toFixed(1) : '—'}</div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {loading ? (
            <div style={{ padding: 12, color: '#666' }}>Loading chart data…</div>
          ) : chartData && chartData.length > 0 ? (
            <div style={{ height: 520 }}>
              <PriceChart candles={chartData} />
            </div>
          ) : (
            <div style={{ padding: 12, color: '#666' }}>No chart data available for this symbol.</div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 20, color: '#777', fontSize: 13 }}>
        Built by Pooja Sukhdeve · Boston University · 2025
      </div>
    </div>
  );
}
