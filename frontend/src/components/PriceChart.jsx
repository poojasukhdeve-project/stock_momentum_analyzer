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
  Legend,
} from 'recharts';

/**
 * PriceChart
 *
 * Props:
 * - candles:
 *   [
 *     {
 *       date,
 *       open,
 *       high,
 *       low,
 *       close,
 *       volume,
 *       sma20,
 *       ema20
 *     }
 *   ]
 */

export default function PriceChart({
  candles = []
}) {

  /* =========================================
     PREPARE CHART DATA
  ========================================= */

  const data = useMemo(() => {

    if (
      !Array.isArray(candles) ||
      candles.length === 0
    ) {
      return [];
    }

    const mapped = candles

      .map(c => {

        // -----------------------------
        // SAFE DATE PARSING
        // -----------------------------

        const rawDate =
          c.date
            ? new Date(c.date)
            : null;

        const isValidDate =
          rawDate &&
          !Number.isNaN(
            rawDate.getTime()
          );

        const dateStr =
          isValidDate
            ? rawDate
                .toISOString()
                .slice(0, 10)
            : 'N/A';

        // -----------------------------
        // SAFE NUMBER PARSING
        // -----------------------------

        const close =
          Number(c.close);

        const sma20 =
          c.sma20 != null
            ? Number(c.sma20)
            : null;

        const ema20 =
          c.ema20 != null
            ? Number(c.ema20)
            : null;

        return {

          date: dateStr,

          close:
            !Number.isNaN(close)
              ? close
              : null,

          sma20:
            !Number.isNaN(sma20)
              ? sma20
              : null,

          ema20:
            !Number.isNaN(ema20)
              ? ema20
              : null,

          _rawDate: rawDate

        };
      })

      // -----------------------------
      // FILTER INVALID DATA
      // -----------------------------

      .filter(
        d =>
          d.close !== null &&
          d._rawDate &&
          !Number.isNaN(
            d._rawDate.getTime()
          )
      )

      // -----------------------------
      // SORT BY DATE
      // -----------------------------

      .sort(
        (a, b) =>
          a._rawDate -
          b._rawDate
      )

      // -----------------------------
      // REMOVE TEMP FIELD
      // -----------------------------

      .map(
        ({
          _rawDate,
          ...rest
        }) => rest
      );

    return mapped;

  }, [candles]);

  /* =========================================
     EMPTY STATE
  ========================================= */

  if (
    !data ||
    data.length === 0
  ) {

    return (

      <div
        style={{
          height: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
          fontSize: 16
        }}
      >
        No chart data available
      </div>

    );
  }

  /* =========================================
     UI
  ========================================= */

  return (

    <div
      style={{
        width: '100%',
        height: 400
      }}
    >

      <ResponsiveContainer
        width="100%"
        height="100%"
      >

        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 20,
            left: 10,
            bottom: 10
          }}
        >

          {/* GRID */}

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e7eb"
          />

          {/* LEGEND */}

          <Legend />

          {/* X AXIS */}

          <XAxis
            dataKey="date"
            tick={{
              fontSize: 12
            }}
            minTickGap={20}
          />

          {/* Y AXIS */}

          <YAxis
            tick={{
              fontSize: 12
            }}
            domain={[
              'auto',
              'auto'
            ]}
            allowDataOverflow={
              false
            }
            tickFormatter={
              value =>
                `$${value}`
            }
          />

          {/* TOOLTIP */}

          <Tooltip
            formatter={(
              value,
              name
            ) => [

              `$${Number(
                value
              ).toFixed(2)}`,

              name

            ]}
            labelFormatter={
              label =>
                `Date: ${label}`
            }
            contentStyle={{
              borderRadius:
                '10px',

              border:
                '1px solid #ddd'
            }}
          />

          {/* CLOSE PRICE */}

          <Line
            type="monotone"
            dataKey="close"
            stroke="#4f46e5"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 5
            }}
            name="Close"
            animationDuration={
              800
            }
            connectNulls={
              false
            }
          />

          {/* SMA20 */}

          <Line
            type="monotone"
            dataKey="sma20"
            stroke="#facc15"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 4
            }}
            name="SMA20"
            animationDuration={
              800
            }
            connectNulls={
              false
            }
          />

          {/* EMA20 */}

          <Line
            type="monotone"
            dataKey="ema20"
            stroke="#9333ea"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 4
            }}
            name="EMA20"
            animationDuration={
              800
            }
            connectNulls={
              false
            }
          />

        </LineChart>

      </ResponsiveContainer>

    </div>
  );
}