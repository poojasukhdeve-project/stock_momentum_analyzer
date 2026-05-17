// backend/src/routes/stockRoutes.js

const express = require('express');

const router = express.Router();

const StockCandle =
  require('../models/StockCandle');

const {
  computeIndicators
} = require('../services/indicators');

const {
  getMomentumSummary
} = require('../utils/momentumScore');

/* =========================================
   IMPORTANT
========================================= */

const LATEST_DATASET_DATE =
  '2026-01-20';

/* =========================================
   RETURN %
========================================= */

function computeReturnPctPercent(
  firstClose,
  lastClose
) {

  if (
    firstClose === undefined ||
    firstClose === null ||
    firstClose === 0
  ) {
    return null;
  }

  if (
    isNaN(firstClose) ||
    isNaN(lastClose)
  ) {
    return null;
  }

  const pct =
    (
      (
        lastClose -
        firstClose
      ) / firstClose
    ) * 100;

  return Math.round(
    pct * 100
  ) / 100;
}

/* =========================================
   FORMAT DATE
========================================= */

function fmtDateToYMD(d) {

  if (!d) {
    return null;
  }

  const parsed =
    new Date(d);

  if (
    !isNaN(
      parsed.getTime()
    )
  ) {

    return parsed
      .toISOString()
      .slice(0, 10);
  }

  return null;
}

/* =========================================
   RANGE DATE
========================================= */

function getRangeStartDate(
  range
) {

  const latest =
    new Date(
      LATEST_DATASET_DATE
    );

  latest.setDate(
    latest.getDate() -
      range
  );

  return latest;
}

/* =========================================================
   COMPARE LIST
========================================================= */

router.get(
  '/compare/list',

  async (req, res) => {

    try {

      const raw =
        req.query.symbols || '';

      const symbols =
        raw
          .split(',')
          .map(s =>
            (s || '')
              .trim()
              .toUpperCase()
          )
          .filter(Boolean);

      let range =
        parseInt(
          req.query.range,
          10
        );

      if (
        !range ||
        Number.isNaN(range) ||
        range <= 0
      ) {

        range = 90;
      }

      if (!symbols.length) {

        return res
          .status(400)
          .json({
            message:
              'No symbols provided'
          });
      }

      const fromDate =
        getRangeStartDate(
          range
        );

      const results = [];

      for (const sym of symbols) {

        const candles =
          await StockCandle
            .find({

              symbol: sym,

              date: {
                $gte:
                  fromDate
              }

            })
            .sort({
              date: 1
            })
            .lean();

        if (
          !candles ||
          candles.length === 0
        ) {

          results.push({

            symbol: sym,

            returnPct: null,

            sma20: null,

            ema20: null,

            rsi14: null,

            startDate: null,

            endDate: null

          });

          continue;
        }

        const indicators =
          computeIndicators(
            candles
          );

        const firstClose =
          Number(
            candles[0].close
          );

        const lastClose =
          Number(
            candles[
              candles.length - 1
            ].close
          );

        const returnPct =
          computeReturnPctPercent(
            firstClose,
            lastClose
          );

        const lastInd =
          indicators[
            indicators.length - 1
          ] || {};

        results.push({

          symbol: sym,

          returnPct,

          sma20:
            lastInd.sma20 != null
              ? Number(
                  lastInd.sma20
                )
              : null,

          ema20:
            lastInd.ema20 != null
              ? Number(
                  lastInd.ema20
                )
              : null,

          rsi14:
            lastInd.rsi14 != null
              ? Number(
                  lastInd.rsi14
                )
              : null,

          startDate:
            fmtDateToYMD(
              candles[0].date
            ),

          endDate:
            fmtDateToYMD(
              candles[
                candles.length - 1
              ].date
            )

        });
      }

      return res.json(
        results
      );

    } catch (err) {

      console.error(
        'compare/list error:',
        err
      );

      return res
        .status(500)
        .json({
          message:
            'Server error'
        });
    }
  }
);

/* =========================================================
   CANDLES ROUTE
========================================================= */

router.get(
  '/:symbol',

  async (req, res) => {

    try {

      const symbol =
        req.params.symbol
          .toUpperCase();

      const {
        from,
        to
      } = req.query;

      const q = {
        symbol
      };

      q.date = {};

      if (from) {

        q.date.$gte =
          new Date(from);

      } else {

        q.date.$gte =
          getRangeStartDate(
            365
          );
      }

      if (to) {

        q.date.$lte =
          new Date(to);
      }

      const docs =
        await StockCandle
          .find(q)
          .sort({
            date: 1
          })
          .lean();

      const indicators =
        computeIndicators(
          docs
        );

     const candles =
  indicators.map(d => ({

    date:
      fmtDateToYMD(
        d.date
      ),

    open:
      d.open != null
        ? Number(d.open)
        : 0,

    high:
      d.high != null
        ? Number(d.high)
        : 0,

    low:
      d.low != null
        ? Number(d.low)
        : 0,

    close:
      d.close != null
        ? Number(d.close)
        : 0,

    volume:
      d.volume != null
        ? Number(d.volume)
        : 0,

    sma20:
      d.sma20 != null
        ? Number(
            d.sma20
          )
        : null,

    ema20:
      d.ema20 != null
        ? Number(
            d.ema20
          )
        : null,

    rsi14:
      d.rsi14 != null
        ? Number(
            d.rsi14
          )
        : null

}));

      return res.json(
        candles
      );

    } catch (err) {

      console.error(err);

      return res
        .status(500)
        .json({
          message:
            'Server error'
        });
    }
  }
);

/* =========================================================
   SUMMARY ROUTE
========================================================= */

router.get(
  '/:symbol/summary',

  async (req, res) => {

    try {

      const symbol =
        req.params.symbol
          .toUpperCase();

      let range =
        parseInt(
          req.query.range || '90',
          10
        );

      if (
        !range ||
        Number.isNaN(range) ||
        range <= 0
      ) {

        range = 90;
      }

      const fromDate =
        getRangeStartDate(
          range
        );

      const candles =
        await StockCandle
          .find({

            symbol,

            date: {
              $gte:
                fromDate
            }

          })
          .sort({
            date: 1
          })
          .lean();

      console.log(
        `[summary] ${symbol} | range=${range} | candles=${candles.length}`
      );

      if (
        !candles ||
        candles.length === 0
      ) {

        return res.json(
          null
        );
      }

      /* =====================================
         INDICATORS
      ===================================== */

      const indicators =
        computeIndicators(
          candles
        );

      /* =====================================
         MOMENTUM SUMMARY
      ===================================== */

      let summary =
        getMomentumSummary(
          candles,
          indicators
        );

      /* =====================================
         FALLBACK SUMMARY
      ===================================== */

      if (!summary) {

        const firstClose =
          Number(
            candles[0].close
          );

        const lastClose =
          Number(
            candles[
              candles.length - 1
            ].close
          );

        const returnPct =
          computeReturnPctPercent(
            firstClose,
            lastClose
          );

        const returns = [];

        for (
          let i = 1;
          i < candles.length;
          i++
        ) {

          const prev =
            Number(
              candles[i - 1]
                .close
            );

          const cur =
            Number(
              candles[i]
                .close
            );

          if (prev) {

            returns.push(
              (
                cur - prev
              ) / prev
            );
          }
        }

        let avgGain = 0;

        let avgLoss = 0;

        const gains =
          returns.filter(
            r => r > 0
          );

        const losses =
          returns
            .filter(
              r => r < 0
            )
            .map(
              Math.abs
            );

        if (gains.length) {

          avgGain =
            gains.reduce(
              (
                a,
                b
              ) => a + b,
              0
            ) /
            gains.length;
        }

        if (losses.length) {

          avgLoss =
            losses.reduce(
              (
                a,
                b
              ) => a + b,
              0
            ) /
            losses.length;
        }

        const mean =
          returns.length
            ? returns.reduce(
                (
                  a,
                  b
                ) => a + b,
                0
              ) /
              returns.length
            : 0;

        const variance =
          returns.length
            ? returns.reduce(
                (
                  a,
                  b
                ) =>

                  a +
                  Math.pow(
                    b -
                      mean,
                    2
                  ),

                0
              ) /
              returns.length
            : 0;

        const stdev =
          Math.sqrt(
            variance
          );

        const score =
          stdev
            ? mean /
              stdev
            : mean * 100;

        let label =
          'Neutral';

        if (
          returnPct != null
        ) {

          const frac =
            returnPct /
            100;

          label =
            frac > 0.005
              ? 'Bullish'
              : frac < -0.005
              ? 'Bearish'
              : 'Neutral';
        }

        summary = {

          symbol,

          startDate:
            candles[0]
              .date,

          endDate:
            candles[
              candles.length - 1
            ].date,

          score,

          returnPct,

          avgGain,

          avgLoss,

          label
        };
      }

      /* =====================================
         NORMALIZE RETURN %
      ===================================== */

      if (
        summary.returnPct !==
          undefined &&
        summary.returnPct !==
          null
      ) {

        if (
          Math.abs(
            summary.returnPct
          ) <= 1
        ) {

          summary.returnPct =
            Math.round(
              summary.returnPct *
                10000
            ) / 100;

        } else {

          summary.returnPct =
            Math.round(
              summary.returnPct *
                100
            ) / 100;
        }
      }

      /* =====================================
         LAST INDICATOR
      ===================================== */

      const lastInd =
        indicators[
          indicators.length - 1
        ] || {};

      /* =====================================
         EXTRA ANALYTICS
      ===================================== */

      const currentPrice =
        candles.length
          ? Number(
              candles[
                candles.length - 1
              ].close
            )
          : null;

      const avgVolume =
        candles.length
          ? candles.reduce(
              (
                sum,
                c
              ) =>

                sum +
                Number(
                  c.volume || 0
                ),

              0
            ) /
            candles.length
          : null;

      const closes =
        candles.map(c =>
          Number(c.close)
        );

      const high52 =
        closes.length
          ? Math.max(
              ...closes
            )
          : null;

      const low52 =
        closes.length
          ? Math.min(
              ...closes
            )
          : null;

      /* =====================================
         TREND
      ===================================== */

      let trend =
        'Neutral';

      if (
        summary.returnPct !=
          null
      ) {

        if (
          summary.returnPct >
          10
        ) {

          trend =
            'Bullish';

        } else if (
          summary.returnPct <
          -10
        ) {

          trend =
            'Bearish';
        }
      }

      /* =====================================
         FINAL OUTPUT
      ===================================== */

      const out = {

        ...summary,

        startDate:
          fmtDateToYMD(
            summary.startDate
          ),

        endDate:
          fmtDateToYMD(
            summary.endDate
          ),

        sma20:
          lastInd.sma20 !=
          null
            ? Number(
                lastInd.sma20
              )
            : null,

        ema20:
          lastInd.ema20 !=
          null
            ? Number(
                lastInd.ema20
              )
            : null,

        rsi14:
          lastInd.rsi14 !=
          null
            ? Number(
                lastInd.rsi14
              )
            : null,

        currentPrice,

        avgVolume,

        high52,

        low52,

        trend
      };

      return res.json(out);

    } catch (err) {

      console.error(err);

      return res
        .status(500)
        .json({
          message:
            'Server error'
        });
    }
  }
);

module.exports =
  router;