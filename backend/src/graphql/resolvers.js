// backend/src/graphql/resolvers.js
const StockCandle = require('../models/StockCandle');
const { computeIndicators } = require('../services/indicators');
const { getMomentumSummary } = require('../utils/momentumScore');

/**
 * Helper: format a Date or date-string to 'YYYY-MM-DD' safely.
 */
function fmtDate(d) {
  if (!d) return null;
  if (d instanceof Date && !isNaN(d)) return d.toISOString().slice(0, 10);
  // if it's a string, try to parse
  try {
    const parsed = new Date(d);
    if (!isNaN(parsed)) return parsed.toISOString().slice(0, 10);
  } catch (e) {}
  return String(d).slice(0, 10);
}

/**
 * Small fallback summary generator (best-effort) when getMomentumSummary returns null.
 * Accepts docs array (ascending sorted).
 */
function fallbackSummaryFromDocs(docs = []) {
  if (!Array.isArray(docs) || docs.length === 0) return null;
  const asc = docs.slice(); // assume already ascending by date
  const firstClose = Number(asc[0].close);
  const lastClose = Number(asc[asc.length - 1].close);
  const returnPct = (firstClose && !Number.isNaN(firstClose)) ? (lastClose - firstClose) / firstClose : null;

  const returns = [];
  for (let i = 1; i < asc.length; i++) {
    const prev = Number(asc[i - 1].close);
    const cur = Number(asc[i].close);
    if (prev) returns.push((cur - prev) / prev);
  }

  let avgGain = null, avgLoss = null;
  if (returns.length > 0) {
    const gains = returns.filter(r => r > 0);
    const losses = returns.filter(r => r < 0).map(r => Math.abs(r));
    avgGain = gains.length ? (gains.reduce((a,b)=>a+b,0) / gains.length) : 0;
    avgLoss = losses.length ? (losses.reduce((a,b)=>a+b,0) / losses.length) : 0;
  }

  const mean = returns.length ? (returns.reduce((a,b)=>a+b,0) / returns.length) : 0;
  const variance = returns.length ? (returns.reduce((a,b)=>a + Math.pow(b-mean,2),0) / returns.length) : 0;
  const stdev = Math.sqrt(variance);
  const score = stdev ? (mean / stdev) : (mean * 100);

  let label = 'Neutral';
  if (returnPct !== null) {
    label = returnPct > 0.005 ? 'Bullish' : (returnPct < -0.005 ? 'Bearish' : 'Neutral');
  }

  return {
    symbol: asc[0].symbol || null,
    startDate: asc[0].date,
    endDate: asc[asc.length - 1].date,
    returnPct,
    score,
    avgGain,
    avgLoss,
    label
  };
}

module.exports = {
  candles: async ({ symbol, from, to }) => {
    try {
      if (!symbol) return [];
      const q = { symbol: symbol.toUpperCase() };
      if (from || to) {
        q.date = {};
        if (from) q.date.$gte = new Date(from);
        if (to) q.date.$lte = new Date(to);
      }
      const docs = await StockCandle.find(q).sort({ date: 1 }).lean();
      return docs.map(d => ({
        date: d.date ? (d.date instanceof Date ? d.date.toISOString().slice(0,10) : String(d.date).slice(0,10)) : null,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
        volume: d.volume
      }));
    } catch (err) {
      console.error('GraphQL candles resolver error:', err);
      return []; // GraphQL expects an array
    }
  },

  momentum: async ({ symbol, range }) => {
    try {
      if (!symbol) return null;
      // set a sane default range (90) if invalid or missing
      range = parseInt(range, 10);
      if (!range || Number.isNaN(range) || range <= 0) range = 90;

      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - range);

      const docs = await StockCandle.find({
        symbol: symbol.toUpperCase(),
        date: { $gte: fromDate }
      }).sort({ date: 1 }).lean();

      if (!docs || docs.length === 0) return null;

      const indicators = computeIndicators(docs);
      let summary = getMomentumSummary(docs, indicators);

      // fallback if summary util returns null (best-effort)
      if (!summary) {
        console.log(`[graphql momentum] getMomentumSummary returned null for ${symbol}, using fallback`);
        summary = fallbackSummaryFromDocs(docs);
      } else {
        // ensure start/end dates are Date types (or parseable)
        // nothing to do here; we'll format below
      }

      if (!summary) return null;

      return {
        ...summary,
        // make sure returned dates are strings 'YYYY-MM-DD'
        startDate: fmtDate(summary.startDate),
        endDate: fmtDate(summary.endDate)
      };
    } catch (err) {
      console.error('GraphQL momentum resolver error:', err);
      return null;
    }
  }
};
