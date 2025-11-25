// frontend/src/components/PriceChart.jsx
import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

/**
 * PriceChart
 * Props:
 *  - candles: array of candle objects from backend, e.g.
 *      { date: "2025-01-02T00:00:00.000Z", open: 130, high:132, low:129, close:131, volume:90000000 }
 */
export default function PriceChart({ candles = [] }) {
  // Normalize and prepare data (memoized)
  const data = useMemo(() => {
    if (!Array.isArray(candles) || candles.length === 0) return [];

    // Map to { date, close } and ensure date is a string 'YYYY-MM-DD'
    const mapped = candles
      .map((c) => {
        const rawDate = c.date ? new Date(c.date) : null;
        const dateStr = rawDate && !Number.isNaN(rawDate)
          ? rawDate.toISOString().slice(0, 10)
          : (c.date ? String(c.date).slice(0, 10) : 'N/A');

        return {
          // keep original numeric close for domain calculations
          close: c.close != null ? Number(c.close) : null,
          date: dateStr,
          _rawDate: rawDate
        };
      })
      // filter out invalid items
      .filter((d) => d.close !== null && d._rawDate && !Number.isNaN(d._rawDate))
      // sort ascending by raw date so chart X axis flows left -> right
      .sort((a, b) => a._rawDate - b._rawDate)
      // remove helper prop before passing to recharts
      .map(({ _rawDate, ...rest }) => rest);

    return mapped;
  }, [candles]);

  // tooltip formatter
  const tooltipFormatter = (value, name, props) => {
    if (value === null || value === undefined) return ['—', name];
    return [Number(value).toFixed(2), 'Close'];
  };

  const tooltipLabelFormatter = (label) => label; // label is dateStr already

  // Determine if we have data
  if (!data || data.length === 0) {
    return (
      <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
        No chart data available
      </div>
    );
  }

  return (
    <div style={{ height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e9e9e9" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            // let recharts auto-calc domain, add small padding
            domain={['dataMin', 'dataMax']}
            allowDataOverflow={false}
          />
          <Tooltip
            formatter={tooltipFormatter}
            labelFormatter={tooltipLabelFormatter}
            contentStyle={{ borderRadius: 6 }}
          />
          <Line
            type="monotone"
            dataKey="close"
            stroke="#4f46e5"        // nice indigo-ish color
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
