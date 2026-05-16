// frontend/src/components/MomentumCard.jsx

import React from 'react';

/**
 * Format percentage safely
 * Backend already sends real percentage values
 * Example:
 * 71.2 -> 71.20%
 */
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

/**
 * Format normal numbers
 */
function formatNum(v, digits = 2) {

  if (
    v === null ||
    v === undefined ||
    Number.isNaN(v)
  ) {
    return '—';
  }

  return Number(v).toFixed(digits);
}

/**
 * Format date safely
 */
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

export default function MomentumCard({
  summary
}) {

  // -----------------------------------
  // NO DATA
  // -----------------------------------

  if (summary === null) {

    return (
      <div style={styles.empty}>
        <h3 style={{ marginTop: 0 }}>
          Summary
        </h3>

        <div>
          Summary not available
        </div>
      </div>
    );
  }

  // -----------------------------------
  // LOADING
  // -----------------------------------

  if (!summary) {

    return (
      <div style={{ padding: 12 }}>
        Loading...
      </div>
    );
  }

  // -----------------------------------
  // SAFE VALUES
  // -----------------------------------

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

  // -----------------------------------
  // TREND COLORS
  // -----------------------------------

  const trendColor =
    label === 'Bullish'
      ? '#16a34a'
      : label === 'Bearish'
      ? '#dc2626'
      : '#ca8a04';

  return (

    <div style={styles.card}>

      {/* HEADER */}

      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
          marginBottom: 16
        }}
      >

        <h3
          style={{
            margin: 0,
            fontSize: 20
          }}
        >
          {symbol}
        </h3>

        <div
          style={{
            background: trendColor,
            color: '#fff',
            padding:
              '4px 10px',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 600
          }}
        >
          {label}
        </div>

      </div>

      {/* GRID */}

      <div style={styles.grid}>

        <InfoBox
          label="Score"
          value={score}
        />

        <InfoBox
          label="Return"
          value={
            returnPct != null
              ? formatPct(returnPct)
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
            fontWeight: 500
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
   SMALL INFO BOX
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
   STYLES
========================================= */

const styles = {

  card: {
    padding: 18,
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    background: '#fff',
    boxShadow:
      '0 1px 3px rgba(0,0,0,0.06)'
  },

  empty: {
    padding: 14,
    border: '1px solid #ddd',
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
    padding: 12,
    border: '1px solid #f1f5f9',
    borderRadius: 10,
    background: '#fafafa'
  },

  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },

  value: {
    fontSize: 20,
    fontWeight: 700
  },

  periodBox: {
    marginTop: 18,
    paddingTop: 12,
    borderTop:
      '1px solid #eee'
  }
};