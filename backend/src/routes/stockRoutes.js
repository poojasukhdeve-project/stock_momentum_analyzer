// backend/src/routes/stockRoutes.js
const express = require('express');
const router = express.Router();
const StockCandle = require('../models/StockCandle');
const { computeIndicators } = require('../services/indicators');
const { getMomentumSummary } = require('../utils/momentumScore');

/**
 * Utility: safe percent number (returns number or null)
 * input: firstClose, lastClose (numbers)
 * returns percent rounded to 2 decimals (e.g. 23.45) or null
 */
function computeReturnPctPercent(firstClose, lastClose) {
  if (firstClose === undefined || firstClose === null || firstClose === 0) return null;
  if (isNaN(firstClose) || isNaN(lastClose)) return null;
  const pct = ((lastClose - firstClose) / firstClose) * 100;
  return Math.round(pct * 100) / 100;
}

function fmtDateToYMD(d) {
  if (!d) return null;
  if (d instanceof Date && !isNaN(d)) return d.toISOString().slice(0,10);
  if (typeof d === 'string') {
    // if it's already ISO or YYYY-MM-DD, return first 10 chars
    return d.length >= 10 ? d.slice(0,10) : d;
  }
  // fallback
  const parsed = new Date(d);
  return (!isNaN(parsed)) ? parsed.toISOString().slice(0,10) : String(d).slice(0,10);
}

/**
 * Compare list endpoint (server-side compare)
 * GET /api/stocks/compare/list?symbols=AAPL,MSFT&range=180
 *
 * Returns: [{ symbol, returnPct, sma20, ema20, rsi14, startDate, endDate }, ...]
 */
router.get('/compare/list', async (req, res) => {
  try {
    const raw = req.query.symbols || '';
    const symbols = raw.split(',').map(s => (s || '').trim().toUpperCase()).filter(Boolean);
    let range = parseInt(req.query.range, 10);
    if (!range || Number.isNaN(range) || range <= 0) range = 90;

    if (!symbols.length) return res.status(400).json({ message: 'No symbols provided' });

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - range);

    const results = [];

    // fetch sequentially (could be parallelized if needed)
    for (const sym of symbols) {
      const candles = await StockCandle.find({ symbol: sym, date: { $gte: fromDate } }).sort({ date: 1 }).lean();

      if (!candles || candles.length === 0) {
        results.push({
          symbol: sym,
          returnPct: null,
          sma20: null,
          ema20: null,
          rsi14: null,
          startDate: null,
          endDate: null,
          message: 'no data'
        });
        continue;
      }

      const indicators = computeIndicators(candles);
      const firstClose = Number(indicators[0].close);
      const lastClose = Number(indicators[indicators.length - 1].close);
      const returnPct = computeReturnPctPercent(firstClose, lastClose);

      // take last indicator row (most recent)
      const lastInd = indicators[indicators.length - 1] || {};
      const sma20 = (lastInd.sma20 !== undefined && lastInd.sma20 !== null) ? Number(lastInd.sma20) : null;
      const ema20 = (lastInd.ema20 !== undefined && lastInd.ema20 !== null) ? Number(lastInd.ema20) : null;
      const rsi14 = (lastInd.rsi14 !== undefined && lastInd.rsi14 !== null) ? Number(lastInd.rsi14) : null;

      results.push({
        symbol: sym,
        returnPct,
        sma20,
        ema20,
        rsi14,
        startDate: fmtDateToYMD(candles[0].date),
        endDate: fmtDateToYMD(candles[candles.length - 1].date)
      });
    }

    return res.json(results);
  } catch (err) {
    console.error('compare/list error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Candles by symbol
 * Returns list of candles with date normalized to YYYY-MM-DD strings
 */
router.get('/:symbol', async (req,res)=>{
  try{
    const symbol = req.params.symbol.toUpperCase();
    const { from, to } = req.query;
    const q = { symbol };
    if (from || to) q.date = {};
    if (from) q.date.$gte = new Date(from);
    if (to) q.date.$lte = new Date(to);
    const docs = await StockCandle.find(q).sort({ date:1 }).lean();

    const candles = (docs || []).map(d => ({
      date: fmtDateToYMD(d.date),
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      volume: d.volume
    }));

    res.json(candles);
  }catch(err){
    console.error(err); res.status(500).json({ message:'Server error' });
  }
});

/**
 * Summary by symbol (enhanced with sma20/ema20/rsi14)
 */
router.get('/:symbol/summary', async (req,res)=>{
  try{
    const symbol = req.params.symbol.toUpperCase();
    let range = parseInt(req.query.range || '90', 10);
    if (!range || Number.isNaN(range) || range <= 0) range = 90;

    // compute fromDate (range days back)
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - range);

    // fetch candles (ascending order)
    const candles = await StockCandle.find({ symbol, date:{ $gte: fromDate } }).sort({ date:1 }).lean();

    console.log(`[summary] ${symbol} - requested range=${range}, found ${candles.length} candles`);

    // compute indicators
    const indicators = computeIndicators(candles);
    let summary = getMomentumSummary(candles, indicators);

    // if getMomentumSummary returned null, fallback to internal computation (same as before)
    if (!summary) {
      console.log(`[summary] getMomentumSummary returned null -> computing fallback summary for ${symbol}`);

      if (!candles || candles.length === 0) {
        // nothing to do
        return res.json(null);
      }

      // candles are already sorted ascending by date
      const asc = candles.slice();

      const firstClose = Number(asc[0].close);
      const lastClose = Number(asc[asc.length - 1].close);
      // compute returnPct as percent (rounded)
      const returnPct = (firstClose && !Number.isNaN(firstClose)) ? computeReturnPctPercent(firstClose, lastClose) : null;

      // compute day-to-day returns (fractional)
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
        // returnPct here is percent value (23.23) — convert to fraction for label check
        const frac = returnPct / 100;
        label = frac > 0.005 ? 'Bullish' : (frac < -0.005 ? 'Bearish' : 'Neutral');
      }

      summary = {
        symbol,
        startDate: candles[0].date,
        endDate: candles[candles.length - 1].date,
        score,
        returnPct, // percent number
        avgGain,
        avgLoss,
        label
      };

      console.log('[summary] fallback computed:', summary);
    } else {
      console.log('[summary] getMomentumSummary succeeded for', symbol);
      // the util may return returnPct as fraction — convert to percent for consistency
      if (summary.returnPct !== undefined && summary.returnPct !== null) {
        // if value looks like a fraction (between -1 and 1) convert to percent
        if (Math.abs(summary.returnPct) <= 1) {
          summary.returnPct = Math.round(summary.returnPct * 10000) / 100; // fraction -> percent (2 decimals)
        } else {
          // already percent-ish, just round
          summary.returnPct = Math.round(summary.returnPct * 100) / 100;
        }
      } else {
        summary.returnPct = null;
      }
    }

    // attach indicator values (most recent)
    let sma20 = null, ema20 = null, rsi14 = null;
    if (Array.isArray(indicators) && indicators.length > 0) {
      const lastInd = indicators[indicators.length - 1] || {};
      sma20 = (lastInd.sma20 !== undefined && lastInd.sma20 !== null) ? Number(lastInd.sma20) : null;
      ema20 = (lastInd.ema20 !== undefined && lastInd.ema20 !== null) ? Number(lastInd.ema20) : null;
      rsi14 = (lastInd.rsi14 !== undefined && lastInd.rsi14 !== null) ? Number(lastInd.rsi14) : null;
    }

    // ensure start/end are YYYY-MM-DD strings
    const out = {
      ...summary,
      startDate: fmtDateToYMD(summary.startDate),
      endDate: fmtDateToYMD(summary.endDate),
      sma20,
      ema20,
      rsi14
    };

    return res.json(out);
  }catch(err){
    console.error(err); res.status(500).json({ message:'Server error' });
  }
});

module.exports = router;
