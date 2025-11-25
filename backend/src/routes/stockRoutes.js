const express = require('express');
const router = express.Router();
const StockCandle = require('../models/StockCandle');
const { computeIndicators } = require('../services/indicators');
const { getMomentumSummary } = require('../utils/momentumScore');

router.get('/:symbol', async (req,res)=>{
  try{
    const symbol = req.params.symbol.toUpperCase();
    const { from, to } = req.query;
    const q = { symbol };
    if (from || to) q.date = {};
    if (from) q.date.$gte = new Date(from);
    if (to) q.date.$lte = new Date(to);
    const candles = await StockCandle.find(q).sort({ date:1 }).lean();
    res.json(candles);
  }catch(err){
    console.error(err); res.status(500).json({ message:'Server error' });
  }
});

router.get('/:symbol/summary', async (req,res)=>{
  try{
    const symbol = req.params.symbol.toUpperCase();
    const range = parseInt(req.query.range || '90', 10);

    // compute fromDate (range days back)
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - range);

    // fetch candles (ascending order)
    const candles = await StockCandle.find({ symbol, date:{ $gte: fromDate } }).sort({ date:1 }).lean();

    console.log(`[summary] ${symbol} - requested range=${range}, found ${candles.length} candles`);

    // first try to compute the existing summary using your util
    const indicators = computeIndicators(candles);
    let summary = getMomentumSummary(candles, indicators);

    // if the existing summary util returned falsy (null), produce a best-effort summary
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
      const returnPct = firstClose ? (lastClose - firstClose) / firstClose : null;

      // compute day-to-day returns
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

      summary = {
        symbol,
        startDate: asc[0].date,
        endDate: asc[asc.length - 1].date,
        score,
        returnPct,
        avgGain,
        avgLoss,
        label
      };

      console.log('[summary] fallback computed:', summary);
    } else {
      console.log('[summary] getMomentumSummary succeeded for', symbol);
    }

    return res.json(summary);
  }catch(err){
    console.error(err); res.status(500).json({ message:'Server error' });
  }
});

module.exports = router;
