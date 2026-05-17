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
  BarChart,
  Bar,
  Cell,
} from 'recharts';

export default function PriceChart({
  candles = [],
}) {

  /* =========================================
     PREPARE DATA
  ========================================= */

  const data = useMemo(() => {

    if (
      !Array.isArray(candles) ||
      candles.length === 0
    ) {
      return [];
    }

    return candles

      .map((c) => {

        const rawDate =
          c.date
            ? new Date(c.date)
            : null;

        const validDate =
          rawDate &&
          !Number.isNaN(
            rawDate.getTime()
          );

        /* FIXED OPEN/CLOSE */
        const open =
          c.open != null
            ? Number(c.open)
            : null;

        const close =
          c.close != null
            ? Number(c.close)
            : null;

        /* FIXED VOLUME */
        let volume =
          c.volume != null
            ? Number(c.volume)
            : 0;

        if (
          Number.isNaN(volume) ||
          volume < 0
        ) {
          volume = 0;
        }

        return {

          date: validDate
            ? rawDate
                .toISOString()
                .slice(0, 10)
            : 'N/A',

          close,

          open,

          sma20:
            c.sma20 != null
              ? Number(c.sma20)
              : null,

          ema20:
            c.ema20 != null
              ? Number(c.ema20)
              : null,

          volume,

         volumeColor: '#3b82f6',

          _rawDate: rawDate,

        };
      })

      /* FIXED FILTER */
      .filter(
        (d) =>
          d.close != null &&
          d._rawDate &&
          !Number.isNaN(
            d._rawDate.getTime()
          )
      )

      .sort(
        (a, b) =>
          a._rawDate -
          b._rawDate
      )

      .map(
        ({
          _rawDate,
          ...rest
        }) => rest
      );

  }, [candles]);

  console.log(
    'CHART DATA:',
    data
  );

  /* =========================================
     EMPTY STATE
  ========================================= */

  if (!data.length) {

    return (

      <div
        style={{
          height: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
        }}
      >
        No chart data available
      </div>

    );
  }

  return (

    <div
      style={{
        width: '100%',
        background: '#fff',
        borderRadius: 18,
        padding: 20,
        border: '1px solid #e5e7eb',
      }}
    >

      {/* =====================================
          TITLE
      ===================================== */}

      <h3
        style={{
          marginBottom: 16,
          fontSize: 22,
          fontWeight: 700,
          color: '#111827',
        }}
      >
        Price Chart (With SMA20, EMA20)
      </h3>

      {/* =====================================
          PRICE CHART
      ===================================== */}

      <div
        style={{
          width: '100%',
          height: 420,
        }}
      >

        <ResponsiveContainer width="100%" height="100%">

          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 20,
              left: 10,
              bottom: 10,
            }}
          >

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
            />

            <Legend />

            <XAxis
              dataKey="date"
              tick={{
                fontSize: 12,
              }}
              minTickGap={35}
            />

            <YAxis
              tick={{
                fontSize: 12,
              }}

              domain={[
                'auto',
                'auto'
              ]}

              tickFormatter={
                (value) =>
                  `$${value}`
              }
            />

            <Tooltip
              formatter={(
                value,
                name
              ) => [

                `$${Number(
                  value
                ).toFixed(2)}`,

                name,

              ]}

              labelFormatter={
                (label) =>
                  `Date: ${label}`
              }
            />

            <Line
              type="monotone"
              dataKey="close"
              stroke="#2563eb"
              strokeWidth={2.5}
              dot={false}
              name="Close"
            />

            <Line
              type="monotone"
              dataKey="sma20"
              stroke="#facc15"
              strokeWidth={2}
              dot={false}
              name="SMA20"
            />

            <Line
              type="monotone"
              dataKey="ema20"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              name="EMA20"
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

      {/* =====================================
          VOLUME CHART
      ===================================== */}

      <div
        style={{
          marginTop: 30,
        }}
      >

        <h4
          style={{
            marginBottom: 12,
            color: '#2563eb',
            fontWeight: 700,
            fontSize: 20,
          }}
        >
          Volume
        </h4>

        <div
          style={{
            width: '100%',
            height: 320,
            minHeight: 320,
            background: '#fff',
            display: 'block',
          }}
    >

          <ResponsiveContainer width="100%" height={300}>

            <BarChart
              data={data}
              margin={{
                top: 10,
                right: 20,
                left: 10,
                bottom: 10,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
              />

              <XAxis
                dataKey="date"
                hide
              />

              <YAxis
                tick={{
                  fontSize: 11,
                }}

                domain={[
                  0,
                  'dataMax'
                ]}

                tickFormatter={(value) =>
                  `${(
                    value / 1000000
                  ).toFixed(0)}M`
                }
              />

              <Tooltip
                formatter={(
                  value
                ) => [

                  `${(
                    value /
                    1000000
                  ).toFixed(2)}M`,

                  'Volume',

                ]}
              />

              <Bar
                dataKey="volume"
                barSize={4}
                radius={[2, 2, 0, 0]}
              >

                {data.map(
                  (
                    entry,
                    index
                  ) => (

                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.volumeColor
                      }
                    />

                  )
                )}

              </Bar>

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

    </div>
  );
}