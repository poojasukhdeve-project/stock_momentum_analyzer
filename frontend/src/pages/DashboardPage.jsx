// frontend/src/pages/DashboardPage.jsx

import React, {
  useEffect,
  useState,
  useMemo
} from 'react';

import axios from 'axios';

import SymbolSearch from '../components/SymbolSearch';
import PriceChart from '../components/PriceChart';
import MomentumCard from '../components/MomentumCard';

const API =
  import.meta.env.VITE_API_BASE ||
  'http://localhost:5000';

const DEFAULT_SYMBOLS = [
  'AAPL',
  'MSFT',
  'TSLA',
  'AMZN',
  'GOOGL'
];

const LATEST_DATASET_DATE =
  '2026-01-20';

const DEFAULT_RANGE = 365;

export default function DashboardPage({
  selectedSymbol,
  onSymbolChange
}) {

  /* =========================================
     STATES
  ========================================= */

  const [localSymbol, setLocalSymbol] =
    useState(
      selectedSymbol || 'AAPL'
    );

  const [range, setRange] =
    useState(DEFAULT_RANGE);

  const [fromDate, setFromDate] =
    useState('');

  const [toDate, setToDate] =
    useState('');

  const [candles, setCandles] =
    useState([]);

  const [summary, setSummary] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const [compareData, setCompareData] =
    useState([]);

  /* =========================================
     UPDATE SELECTED SYMBOL
  ========================================= */

  useEffect(() => {

    if (selectedSymbol) {
      setLocalSymbol(selectedSymbol);
    }

  }, [selectedSymbol]);

  /* =========================================
     HANDLE SYMBOL CHANGE
  ========================================= */

  function handleSymbolChange(symbol) {

    setLocalSymbol(symbol);

    if (
      typeof onSymbolChange ===
      'function'
    ) {
      onSymbolChange(symbol);
    }
  }

  /* =========================================
     NORMALIZE RETURN %
  ========================================= */

  function normalizeReturnPct(raw) {

    if (
      raw === null ||
      raw === undefined
    ) {
      return null;
    }

    const n = Number(raw);

    if (Number.isNaN(n)) {
      return null;
    }

    return Math.abs(n) <= 1
      ? Number(
          (n * 100).toFixed(2)
        )
      : Number(n.toFixed(2));
  }

  /* =========================================
     FETCH STOCK DATA
  ========================================= */

  useEffect(() => {

    let mounted = true;

    async function fetchData() {

      setLoading(true);

      setError('');

      try {

        const symbolEsc =
          encodeURIComponent(
            localSymbol
          );

        let candlesUrl =
          `${API}/api/stocks/${symbolEsc}`;

        let summaryUrl =
          `${API}/api/stocks/${symbolEsc}/summary`;

        /* =====================================
           CUSTOM DATE RANGE
        ===================================== */

        if (
          fromDate &&
          toDate
        ) {

          candlesUrl +=
            `?from=${encodeURIComponent(fromDate)}` +
            `&to=${encodeURIComponent(toDate)}`;

          const diffDays =
            Math.ceil(
              (
                new Date(toDate) -
                new Date(fromDate)
              ) /
              (
                1000 *
                60 *
                60 *
                24
              )
            );

          summaryUrl +=
            `?range=${diffDays}`;

        } else {

          /* ===================================
             RANGE BUTTONS
          =================================== */

          const latest =
            new Date(
              LATEST_DATASET_DATE
            );

          latest.setDate(
            latest.getDate() -
              range
          );

          const fromISO =
            latest
              .toISOString()
              .slice(0, 10);

          candlesUrl +=
            `?from=${encodeURIComponent(fromISO)}`;

          summaryUrl +=
            `?range=${range}`;
        }

        /* =====================================
           FETCH BOTH APIs
        ===================================== */

        const [
          candlesRes,
          summaryRes
        ] = await Promise.all([
          axios.get(candlesUrl),
          axios.get(summaryUrl)
        ]);

        if (!mounted) return;

                console.log(
          'API RESPONSE:',
          candlesRes.data
        );

        const candlesData =
          Array.isArray(
            candlesRes.data?.candles
          )
            ? candlesRes.data.candles

            : Array.isArray(
                candlesRes.data
              )
            ? candlesRes.data

            : [];

        console.log(
          'Candles:',
          candlesData
        );

        setCandles(candlesData);

        setSummary(
          summaryRes.data || null
        );

      } catch (err) {

        console.error(err);

        if (!mounted) return;

        setError(
          'Failed to load stock data'
        );

        setCandles([]);

        setSummary(null);

      } finally {

        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (localSymbol) {
      fetchData();
    }

    return () => {
      mounted = false;
    };

  }, [
    localSymbol,
    range,
    fromDate,
    toDate
  ]);

  /* =========================================
     FETCH COMPARISON DATA
  ========================================= */

  useEffect(() => {

    let mounted = true;

    async function loadCompare() {

      try {

        const symbols =
          DEFAULT_SYMBOLS.join(',');

        const url =
          `${API}/api/stocks/compare/list` +
          `?symbols=${symbols}` +
          `&range=${range}`;

        const res =
          await axios.get(url);

        if (!mounted) return;

        const normalized =
          Array.isArray(res.data)
            ? res.data.map(item => ({

                symbol:
                  item.symbol,

                returnPct:
                  normalizeReturnPct(
                    item.returnPct
                  )

              }))
            : [];

        setCompareData(normalized);

      } catch (err) {

        console.error(
          'Compare error:',
          err
        );

        if (mounted) {
          setCompareData([]);
        }
      }
    }

    loadCompare();

    return () => {
      mounted = false;
    };

  }, [range]);

  /* =========================================
     CHART DATA
  ========================================= */

  const chartData = useMemo(() => {

    return (candles || []).map(c => ({

      date: c.date,

      open:
      c.open != null
        ? Number(c.open)
        : null,

      high:
      c.high != null
        ? Number(c.high)
        : null,

      low:
      c.low != null
        ? Number(c.low)
        : null,

      close:
      c.close != null
        ? Number(c.close)
        : null,

      volume:
        c.volume != null
        ? Number(c.volume)
        : 0,

      sma20:
        c.sma20 != null
          ? Number(c.sma20)
          : null,

      ema20:
        c.ema20 != null
          ? Number(c.ema20)
          : null,

      rsi14:
        c.rsi14 != null
          ? Number(c.rsi14)
          : null

    }));

  }, [candles]);

  /* =========================================
     STYLES
  ========================================= */

  const styles = {

    container: {
      maxWidth: 1320,
      margin: '0 auto',
      padding: 14,
      fontFamily:
        'Arial, sans-serif',
      background: '#f8fafc'
    },

    header: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent:
        'space-between',
      gap: 18,
      flexWrap: 'wrap'
    },

    title: {
      fontSize: 42,
      fontWeight: 800,
      lineHeight: 1,
      color: '#111827'
    },

    controls: {

      flex: 1,

      display: 'flex',

      justifyContent:
        'flex-end',

      alignItems: 'center',

      gap: 10,

      flexWrap: 'wrap'
    },

    select: {
      padding: '10px 12px',
      borderRadius: 8,
      border:
        '1px solid #d1d5db',
      background: '#fff'
    },

    button: active => ({

      padding: '10px 16px',

      borderRadius: 10,

      border: active
        ? '2px solid #111827'
        : '1px solid #d1d5db',

      background:
        active
          ? '#111827'
          : '#fff',

      color:
        active
          ? '#fff'
          : '#111827',

      cursor: 'pointer',

      fontWeight: 700,

      transition: '0.2s'
    }),

    analyzeBtn: {
      padding: '10px 18px',
      borderRadius: 10,
      border: 'none',
      background: '#2563eb',
      color: '#fff',
      cursor: 'pointer',
      fontWeight: 700
    },

    grid: {
      display: 'grid',
      gridTemplateColumns:
        '420px 1fr',
      gap: 18,
      marginTop: 20
    },

    card: {

      border:
        '1px solid #e5e7eb',

      borderRadius: 14,

      padding: 20,

      background: '#fff',

      boxShadow:
        '0 1px 3px rgba(0,0,0,0.06)'
    },

    chartBox: {

      border:
        '1px solid #e5e7eb',

      borderRadius: 14,

      padding: 20,

      background: '#fff',

      boxShadow:
        '0 1px 3px rgba(0,0,0,0.06)'
    },

    compareTitle: {
      marginTop: 20,
      marginBottom: 12,
      fontSize: 20,
      fontWeight: 700,
      color: '#111827'
    },

    compareRow: {

      display: 'flex',

      justifyContent:
        'space-between',

      gap: 12,

      border:
        '1px solid #e5e7eb',

      borderRadius: 14,

      padding: 16,

      background: '#fff',

      boxShadow:
        '0 1px 3px rgba(0,0,0,0.06)'
    }
  };

  /* =========================================
     UI
  ========================================= */

  return (

    <div style={styles.container}>

      {/* HEADER */}

      <div style={styles.header}>

        {/* TITLE */}

        <div>

          <div style={styles.title}>
            STOCK<br />
            MOMENTUM<br />
            ANALYZER
          </div>

          <div
            style={{
              marginTop: 10,
              color: '#6b7280',
              fontSize: 18
            }}
          >
            AI-Driven Trend Scanner ·
            Visual Insights · Signals
          </div>

        </div>

        {/* CONTROLS */}

        <div style={styles.controls}>

          <select
            value={localSymbol}
            onChange={e =>
              handleSymbolChange(
                e.target.value
              )
            }
            style={styles.select}
          >

            {DEFAULT_SYMBOLS.map(
              s => (

                <option
                  key={s}
                  value={s}
                >
                  {s}
                </option>

              )
            )}

          </select>

          <SymbolSearch
            value={localSymbol}
            onChange={
              handleSymbolChange
            }
          />

          {/* RANGE BUTTONS */}

          {[120, 180, 365].map(
            r => (

              <button
                key={r}
                onClick={() => {

                  setRange(r);

                  setFromDate('');

                  setToDate('');

                }}
                style={
                  styles.button(
                    range === r
                  )
                }
              >
                {r}D
              </button>

            )
          )}

          {/* DATE PICKERS */}

          <input
            type="date"
            value={fromDate}
            onChange={e =>
              setFromDate(
                e.target.value
              )
            }
            style={styles.select}
          />

          <input
            type="date"
            value={toDate}
            onChange={e =>
              setToDate(
                e.target.value
              )
            }
            style={styles.select}
          />

          <button
            style={
              styles.analyzeBtn
            }
          >
            Analyze
          </button>

        </div>

      </div>

      {/* MAIN GRID */}

      <div style={styles.grid}>

        {/* LEFT PANEL */}

        <div>

          <div style={styles.card}>

            <h2>
              Summary Card
            </h2>

            {loading ? (

              <div>
                Loading...
              </div>

            ) : (

              <MomentumCard
                summary={summary}
              />

            )}

          </div>

        </div>

        {/* RIGHT PANEL */}

        <div>

          {/* CHART */}

          <div style={styles.chartBox}>

            {loading ? (

              <div>
                Loading Chart...
              </div>

            ) : (

              <PriceChart
                candles={
                  chartData
                }
              />

            )}

          </div>

          {/* COMPARISON TITLE */}

          <h3
            style={
              styles.compareTitle
            }
          >
            Market Comparison (Return %)
          </h3>

          {/* COMPARISON */}

          <div
            style={
              styles.compareRow
            }
          >

            {compareData.map(
              stock => (

                <div
                  key={
                    stock.symbol
                  }
                  style={{
                    textAlign:
                      'center',
                    flex: 1
                  }}
                >

                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 22
                    }}
                  >
                    {stock.symbol}
                  </div>

                  <div
                    style={{
                      color:
                        stock.returnPct >= 0
                          ? '#16a34a'
                          : '#dc2626',

                      fontWeight: 700,
                      fontSize: 28,
                      marginTop: 6
                    }}
                  >

                    {stock.returnPct >= 0
                      ? `+${stock.returnPct}%`
                      : `${stock.returnPct}%`}

                  </div>

                </div>

              )
            )}

          </div>

          {/* ERROR */}

          {error && (

            <div
              style={{
                color: 'crimson',
                marginTop: 12
              }}
            >
              {error}
            </div>

          )}

        </div>

      </div>

    </div>
  );
}