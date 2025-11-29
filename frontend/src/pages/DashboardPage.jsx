// frontend/src/pages/DashboardPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import SymbolSearch from '../components/SymbolSearch';
import PriceChart from '../components/PriceChart';
import MomentumCard from '../components/MomentumCard';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'TSLA', 'AMZN', 'GOOGL'];
const MIN_RANGE_DAYS = 120;      // ensure we request a minimum window that matches seed data
const DEFAULT_RANGE = 365;

export default function DashboardPage({ selectedSymbol, onSymbolChange }) {
  const [localSymbol, setLocalSymbol] = useState(selectedSymbol || 'AAPL');
  useEffect(() => { if (selectedSymbol) setLocalSymbol(selectedSymbol); }, [selectedSymbol]);

  // controls
  const [range, setRange] = useState(DEFAULT_RANGE);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reloadKey, setReloadKey] = useState(0); // trigger fetch on analyze click

  // data
  const [candles, setCandles] = useState([]);
  const [summary, setSummary] = useState(undefined); // undefined = loading, null = no summary, object = data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // compare
  const [compareData, setCompareData] = useState([]);
  const [compareLoading, setCompareLoading] = useState(false);

  function handleSymbolChange(s) {
    setLocalSymbol(s);
    if (typeof onSymbolChange === 'function') onSymbolChange(s);
  }

  function enforceMinRange(r) {
    const n = Number(r) || DEFAULT_RANGE;
    return n < MIN_RANGE_DAYS ? MIN_RANGE_DAYS : n;
  }

  function computeRangeFromDates(f, t) {
    if (!f || !t) return null;
    const d1 = new Date(f);
    const d2 = new Date(t);
    if (isNaN(d1) || isNaN(d2)) return null;
    const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : null;
  }

  // helper: format compare returnPct consistent percent number (2 decimals)
  function normalizeReturnPct(raw) {
    if (raw === null || raw === undefined) return null;
    const n = Number(raw);
    if (Number.isNaN(n)) return null;
    // backend may return fraction (0.23) or already percent (23)
    return Math.abs(n) <= 1 ? Number((n * 100).toFixed(2)) : Number(n.toFixed(2));
  }

  // fetch candles + summary
  useEffect(() => {
    let mounted = true;
    async function fetchAll() {
      setLoading(true);
      setError(null);

      try {
        const useFromTo = fromDate && toDate;
        const symbolEsc = encodeURIComponent(localSymbol);
        let candlesUrl = `${API}/api/stocks/${symbolEsc}`;
        let summaryUrl = `${API}/api/stocks/${symbolEsc}/summary`;

        if (useFromTo) {
          // ensure we pass safe encoded dates and reasonable computed range
          const computedRange = computeRangeFromDates(fromDate, toDate) || enforceMinRange(range);
          candlesUrl += `?from=${encodeURIComponent(fromDate)}&to=${encodeURIComponent(toDate)}`;
          summaryUrl += `?range=${encodeURIComponent(enforceMinRange(computedRange))}`;
        } else {
          const useRange = enforceMinRange(range);
          summaryUrl += `?range=${encodeURIComponent(useRange)}`;
          // request candles starting from (now - range) as ISO YYYY-MM-DD
          const fromISO = new Date(Date.now() - useRange * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
          candlesUrl += `?from=${encodeURIComponent(fromISO)}`;
        }

        // fetch both in parallel
        const [candlesRes, summaryRes] = await Promise.all([
          axios.get(candlesUrl),
          axios.get(summaryUrl)
        ]);

        if (!mounted) return;

        const cs = Array.isArray(candlesRes.data) ? candlesRes.data : [];
        setCandles(cs);
        // backend summary may be null when not enough data
        setSummary(summaryRes.data ?? null);
      } catch (e) {
        console.error('fetchAll error', e);
        if (!mounted) return;
        setCandles([]);
        setSummary(null);
        setError('Failed to load data — check backend or symbol');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (localSymbol) fetchAll();
    return () => { mounted = false; };
  }, [localSymbol, range, fromDate, toDate, reloadKey]);

  // fetch compare row: try /compare/list then fallback to per-symbol /summary
  useEffect(() => {
    let mounted = true;
    async function loadCompare() {
      setCompareLoading(true);
      try {
        const symbols = DEFAULT_SYMBOLS.join(',');
        const url = `${API}/api/stocks/compare/list?symbols=${encodeURIComponent(symbols)}&range=${encodeURIComponent(enforceMinRange(range))}`;

        try {
          const res = await axios.get(url);
          if (!mounted) return;
          // normalize returnPct to percent number
          const arr = Array.isArray(res.data) ? res.data.map(item => ({
            symbol: item.symbol,
            returnPct: normalizeReturnPct(item.returnPct),
            sma20: item.sma20 ?? null,
            ema20: item.ema20 ?? null,
            rsi14: item.rsi14 ?? null
          })) : [];
          setCompareData(arr);
          return;
        } catch (err) {
          // fallback to per-symbol summaries
          console.warn('compare/list failed, falling back to per-symbol summary', err?.message || err);
        }

        // fallback
        const promises = DEFAULT_SYMBOLS.map(sym =>
          axios.get(`${API}/api/stocks/${encodeURIComponent(sym)}/summary?range=${encodeURIComponent(enforceMinRange(range))}`)
            .then(r => ({ symbol: sym, data: r.data }))
            .catch(e => ({ symbol: sym, data: null }))
        );
        const results = await Promise.all(promises);
        if (!mounted) return;
        const normalized = results.map(r => {
          const s = r.data;
          return {
            symbol: r.symbol,
            returnPct: s && (s.returnPct !== undefined && s.returnPct !== null) ? normalizeReturnPct(s.returnPct) : null,
            sma20: s && s.sma20 ? Number(s.sma20) : null,
            ema20: s && s.ema20 ? Number(s.ema20) : null,
            rsi14: s && s.rsi14 ? Number(s.rsi14) : null
          };
        });
        setCompareData(normalized);
      } catch (err) {
        console.error('compare error', err);
        if (mounted) setCompareData([]);
      } finally {
        if (mounted) setCompareLoading(false);
      }
    }
    loadCompare();
    return () => { mounted = false; };
  }, [range, reloadKey]);

  const chartData = useMemo(() => {
    return (candles || []).map(c => ({
      // ensure date is string YYYY-MM-DD
      date: c.date ? String(c.date).slice(0, 10) : null,
      open: c.open, high: c.high, low: c.low, close: c.close, volume: c.volume
    }));
  }, [candles]);

  // styles
  const styles = {
    container: { maxWidth: 1140, margin: '0 auto', padding: '18px 20px', fontFamily: 'Arial, Helvetica, sans-serif' },
    topRow: { display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' },
    titleBlock: { flex: '0 0 320px' },
    title: { margin: '6px 0 0 0', fontSize: 34, lineHeight: 1, fontWeight: 700 },
    subtitle: { marginTop: 8, color: '#555', fontSize: 13 },
    controlsBlock: { flex: '1 1 600px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' },
    select: { padding: '7px 10px', borderRadius: 6, border: '1px solid #ddd', minWidth: 150, height: 36 },

    rangeBtn: (active) => ({
      padding: '8px 12px',
      borderRadius: 6,
      border: active ? '2px solid #333' : '1px solid #ddd',
      background: active ? '#eef' : 'white',
      color: active ? '#000' : '#333',
      fontWeight: active ? 600 : 400,
      cursor: 'pointer',
      height: 36
    }),

    analyzeBtn: { padding: '8px 14px', borderRadius: 6, border: '1px solid #2b6cb0', background: '#2b6cb0', color: 'white', cursor: 'pointer', height: 36 },

    mainGrid: { marginTop: 18, display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20, alignItems: 'start' },
    card: { border: '1px solid #e6e6e6', padding: 16, borderRadius: 6, background: '#fff' },
    smallMuted: { color: '#666', fontSize: 13 },
    chartBox: { border: '1px solid #eee', borderRadius: 6, padding: 12, minHeight: 420, background: '#fff' },
    compareRow: { marginTop: 16, border: '1px solid #eaeaea', padding: 10, borderRadius: 6, display: 'flex', gap: 14, justifyContent: 'space-between', alignItems: 'center' },
    footer: { marginTop: 26, color: '#777', fontSize: 13, textAlign: 'left' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.topRow}>
        <div style={styles.titleBlock}>
          <h1 style={styles.title}>STOCK MOMENTUM<br />ANALYZER</h1>
          <div style={styles.subtitle}>AI-Driven Trend Scanner · Visual Insights · Signals</div>
        </div>

        <div style={styles.controlsBlock}>
          <select style={styles.select} value={localSymbol} onChange={e => handleSymbolChange(e.target.value)}>
            {DEFAULT_SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
            <option value="">-- custom --</option>
          </select>

          <div style={{ minWidth: 240 }}>
            <SymbolSearch value={localSymbol} onChange={handleSymbolChange} />
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {[120, 180, 365].map(r => (
              <button
                key={r}
                onClick={() => { setRange(enforceMinRange(r)); setFromDate(''); setToDate(''); }}
                style={styles.rangeBtn(range === r)}
                title={`${r} days`}
              >{r}D</button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', height: 36 }} />
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', height: 36 }} />
          </div>

          <button style={styles.analyzeBtn} onClick={() => setReloadKey(k => k + 1)}>Analyze</button>
        </div>
      </div>

      <div style={styles.mainGrid}>
        <div>
          <div style={{ ...styles.card, marginBottom: 12 }}>
            <h3 style={{ marginTop: 0 }}>Summary Card</h3>
            {loading ? <div style={styles.smallMuted}>Loading summary…</div>
              : summary === null ? <div style={styles.smallMuted}>Summary not available (not enough data).</div>
                : summary === undefined ? <div style={styles.smallMuted}>Loading…</div>
                  : <MomentumCard summary={summary} />
            }
          </div>

          <div style={{ ...styles.card, marginBottom: 12 }}>
            <h3 style={{ marginTop: 0 }}>Indicators</h3>
            <div style={{ display: 'flex', gap: 12 }}>
              <ul style={{ paddingLeft: 16 }}>
                <li>SMA20: {summary && summary.sma20 ? Number(summary.sma20).toFixed(2) : '—'}</li>
                <li>EMA20: {summary && summary.ema20 ? Number(summary.ema20).toFixed(2) : '—'}</li>
                <li>RSI14: {summary && summary.rsi14 ? `${Number(summary.rsi14).toFixed(0)}` : '—'}</li>
              </ul>
              <div style={{ flex: 1 }}>
                <strong>BUY / SELL SIGNALS</strong>
                <ul style={{ paddingLeft: 16 }}>
                  <li>BUY — SMA20 crossed above SMA50</li>
                  <li>SELL — RSI crossed above 70</li>
                  <li>BUY — Price sustained above EMA20</li>
                </ul>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={{ marginTop: 0 }}>PRICE CHART (WITH SMA20, EMA20)</h3>
            <p style={styles.smallMuted}>• Blue = Close • Yellow = SMA20 • Purple = EMA20</p>
            <div style={{ marginTop: 8, height: 80, border: '1px dashed #e6e6e6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#bbb' }}>Mini preview (chart)</span>
            </div>
          </div>
        </div>

        <div>
          <div style={styles.chartBox}>
            {loading ? <div style={styles.smallMuted}>Loading chart data…</div> :
              (chartData && chartData.length > 0 ? <PriceChart candles={chartData} /> :
                <div style={{ padding: 12, color: '#666' }}>
                  No chart data available for this symbol.
                  <div style={{ marginTop: 8, fontSize: 13, color: '#999' }}>
                    Tip: try a larger range (e.g. 180 or 365 days) or select a different symbol.
                  </div>
                </div>)
            }
          </div>

          <div style={styles.compareRow}>
            {compareLoading ? <div style={styles.smallMuted}>Loading comparison…</div> :
              compareData.length === 0 ? <div style={styles.smallMuted}>No comparison data</div> :
                compareData.map(s => (
                  <div key={s.symbol} style={{ textAlign: 'center', minWidth: 100 }}>
                    <div style={{ fontWeight: 700 }}>{s.symbol}</div>
                    <div style={{ color: s.returnPct === null || s.returnPct === undefined ? '#777' : (s.returnPct >= 0 ? '#277a3e' : 'crimson') }}>
                      {s.returnPct === null || s.returnPct === undefined ? '—' : (s.returnPct >= 0 ? `+${s.returnPct}%` : `${s.returnPct}%`)}
                    </div>
                  </div>
                ))
            }
          </div>

          {error && <div style={{ marginTop: 12, color: 'crimson' }}>{error}</div>}
        </div>
      </div>

      <div style={styles.footer}>Built by Pooja Sukhdeve · Boston University · 2025</div>
    </div>
  );
}
