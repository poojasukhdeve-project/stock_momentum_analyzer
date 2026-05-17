// frontend/src/components/MomentumCard.jsx

import React from 'react';

/* =========================================
   HELPERS
========================================= */

function formatPct(v) {

  if (
    v === null ||
    v === undefined ||
    Number.isNaN(v)
  ) {
    return '—';
  }

  return `${Number(v).toFixed(2)}%`;
}

function formatNum(
  v,
  digits = 2
) {

  if (
    v === null ||
    v === undefined ||
    Number.isNaN(v)
  ) {
    return '—';
  }

  return Number(v).toFixed(digits);
}

function formatMoney(v) {

  if (
    v === null ||
    v === undefined ||
    Number.isNaN(v)
  ) {
    return '—';
  }

  return `$${Number(v).toFixed(2)}`;
}

function formatVolume(v) {

  if (
    v === null ||
    v === undefined ||
    Number.isNaN(v)
  ) {
    return '—';
  }

  return `${(
    Number(v) / 1000000
  ).toFixed(2)}M`;
}

function formatDate(d) {

  if (!d) return '—';

  const date =
    typeof d === 'string'
      ? new Date(d)
      : d;

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return d;
  }

  return date
    .toISOString()
    .slice(0, 10);
}

/* =========================================
   COMPONENT
========================================= */

export default function MomentumCard({
  summary
}) {

  /* =====================================
     EMPTY
  ===================================== */

  if (summary === null) {

    return (

      <div style={styles.empty}>

        <h3
          style={{
            marginTop: 0
          }}
        >
          Summary
        </h3>

        <div>
          Summary not available
        </div>

      </div>

    );
  }

  /* =====================================
     LOADING
  ===================================== */

  if (!summary) {

    return (
      <div style={{ padding: 12 }}>
        Loading...
      </div>
    );
  }

  /* =====================================
     SAFE VALUES
  ===================================== */

  const symbol =
    summary.symbol ?? 'N/A';

  const label =
    summary.label ?? 'Neutral';

  const score =
    summary.score != null
      ? formatNum(summary.score)
      : '—';

  const returnPct =
    summary.returnPct != null
      ? summary.returnPct
      : null;

  const startDate =
    summary.startDate ??
    summary.start_date;

  const endDate =
    summary.endDate ??
    summary.end_date;

  /* =====================================
     EXTRA METRICS
  ===================================== */

  const currentPrice =
    summary.currentPrice;

  const rsi14 =
    summary.rsi14;

  const avgVolume =
    summary.avgVolume;

  const high52 =
    summary.high52;

  const low52 =
    summary.low52;

  const trend =
    summary.trend ?? label;

  /* =====================================
     TREND COLOR
  ===================================== */

  const trendColor =
    label === 'Bullish'
      ? '#16a34a'
      : label === 'Bearish'
      ? '#dc2626'
      : '#ca8a04';

  /* =====================================
     UI
  ===================================== */

  return (

    <div style={styles.card}>

      {/* HEADER */}

      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
          marginBottom: 18
        }}
      >

        <h3
          style={{
            margin: 0,
            fontSize: 32,
            fontWeight: 800
          }}
        >
          {symbol}
        </h3>

        <div
          style={{
            background:
              trendColor,

            color: '#fff',

            padding:
              '6px 14px',

            borderRadius: 20,

            fontSize: 14,

            fontWeight: 700
          }}
        >
          {label}
        </div>

      </div>

      {/* MAIN GRID */}

      <div style={styles.grid}>

        <InfoBox
          label="Score"
          value={score}
        />

        <InfoBox
          label="Return"
          value={
            returnPct != null
              ? formatPct(
                  returnPct
                )
              : '—'
          }
          valueColor={
            returnPct >= 0
              ? '#16a34a'
              : '#dc2626'
          }
        />

        <InfoBox
          label="Avg Gain"
          value={
            summary.avgGain != null
              ? formatPct(
                  summary.avgGain
                )
              : '—'
          }
          valueColor="#16a34a"
        />

        <InfoBox
          label="Avg Loss"
          value={
            summary.avgLoss != null
              ? formatPct(
                  summary.avgLoss
                )
              : '—'
          }
          valueColor="#dc2626"
        />

      </div>

      {/* EXTRA METRICS */}

      <div style={styles.metricsGrid}>

        <Metric
          label="Current Price"
          value={
            formatMoney(
              currentPrice
            )
          }
        />

        <Metric
          label="RSI (14)"
          value={
            rsi14 != null
              ? formatNum(rsi14)
              : '—'
          }
        />

        <Metric
          label="Volume Avg"
          value={
            formatVolume(
              avgVolume
            )
          }
        />

        <Metric
          label="Trend"
          value={trend}
          color={trendColor}
        />

        <Metric
          label="52W High"
          value={
            formatMoney(
              high52
            )
          }
        />

        <Metric
          label="52W Low"
          value={
            formatMoney(
              low52
            )
          }
        />

      </div>

      {/* PERIOD */}

      <div style={styles.periodBox}>

        <div
          style={{
            fontSize: 12,
            color: '#666'
          }}
        >
          Period
        </div>

        <div
          style={{
            marginTop: 4,
            fontWeight: 600
          }}
        >
          {formatDate(startDate)}
          {' → '}
          {formatDate(endDate)}
        </div>

      </div>

    </div>
  );
}

/* =========================================
   INFO BOX
========================================= */

function InfoBox({
  label,
  value,
  valueColor
}) {

  return (

    <div style={styles.infoBox}>

      <div style={styles.label}>
        {label}
      </div>

      <div
        style={{
          ...styles.value,
          color:
            valueColor || '#111'
        }}
      >
        {value}
      </div>

    </div>
  );
}

/* =========================================
   METRIC
========================================= */

function Metric({
  label,
  value,
  color
}) {

  return (

    <div>

      <div style={styles.metricLabel}>
        {label}
      </div>

      <div
        style={{
          fontWeight: 700,
          color:
            color || '#111827'
        }}
      >
        {value}
      </div>

    </div>
  );
}

/* =========================================
   STYLES
========================================= */

const styles = {

  card: {

    padding: 20,

    border:
      '1px solid #e5e7eb',

    borderRadius: 14,

    background: '#fff',

    boxShadow:
      '0 1px 3px rgba(0,0,0,0.06)'
  },

  empty: {

    padding: 14,

    border:
      '1px solid #ddd',

    borderRadius: 8,

    background: '#fafafa'
  },

  grid: {

    display: 'grid',

    gridTemplateColumns:
      '1fr 1fr',

    gap: 14
  },

  infoBox: {

    padding: 14,

    border:
      '1px solid #f1f5f9',

    borderRadius: 12,

    background: '#fafafa'
  },

  label: {

    fontSize: 12,

    color: '#666',

    marginBottom: 4
  },

  value: {

    fontSize: 32,

    fontWeight: 800
  },

  metricsGrid: {

    marginTop: 20,

    display: 'grid',

    gridTemplateColumns:
      '1fr 1fr',

    gap: 16
  },

  metricLabel: {

    fontSize: 12,

    color: '#666',

    marginBottom: 4
  },

  periodBox: {

    marginTop: 20,

    paddingTop: 14,

    borderTop:
      '1px solid #eee'
  }
};