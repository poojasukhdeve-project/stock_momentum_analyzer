// backend/src/utils/momentumScore.js
// Computes a simple momentum summary (score/label/returns) using indicators array
// Returns returnPct as PERCENT (e.g. 3.45 means 3.45%)

function safeNum(x) {
  const n = Number(x);
  return (n === null || Number.isNaN(n)) ? null : n;
}

function computeAvgGainLossFromCloses(closes) {
  // closes: array of numbers (may contain nulls) in ascending order
  const returns = [];
  for (let i = 1; i < closes.length; i++) {
    const prev = safeNum(closes[i - 1]);
    const cur = safeNum(closes[i]);
    if (prev === null || cur === null || prev === 0) continue;
    returns.push((cur - prev) / prev);
  }

  if (returns.length === 0) return { avgGain: null, avgLoss: null };

  const gains = returns.filter(r => r > 0);
  const losses = returns.filter(r => r < 0).map(r => Math.abs(r));

  const avgGain = gains.length ? gains.reduce((a,b)=>a+b,0) / gains.length : 0;
  const avgLoss = losses.length ? losses.reduce((a,b)=>a+b,0) / losses.length : 0;

  return { avgGain, avgLoss };
}

function getMomentumSummary(candles, indicators) {
  // require both arrays and length > 0
  if (!Array.isArray(candles) || candles.length === 0) return null;
  if (!Array.isArray(indicators) || indicators.length === 0) return null;

  const first = indicators[0];
  const last = indicators[indicators.length - 1];

  if (!first || !last) return null;

  // safe close values
  const firstClose = safeNum(first.close);
  const lastClose = safeNum(last.close);

  // if both closes missing, can't compute
  if (firstClose === null || lastClose === null) return null;

  // returnPct as percentage (rounded to 2 decimals)
  const rawReturnPct = firstClose === 0 ? 0 : ((lastClose - firstClose) / firstClose) * 100;
  const returnPct = Number(rawReturnPct.toFixed(2));

  // compute avgGain/avgLoss from the closes in indicators if available,
  // otherwise fall back to candles closes
  const closesFromIndicators = indicators.map(i => safeNum(i.close));
  const { avgGain, avgLoss } = computeAvgGainLossFromCloses(closesFromIndicators.length > 1 ? closesFromIndicators : candles.map(c => safeNum(c.close)));

  // score calculation (same logic as before, defensive)
  let score = 0;

  if (last.sma20 != null && last.close != null && last.close > last.sma20) score += 20;
  if (last.ema20 != null && last.close != null && last.close > last.ema20) score += 20;

  if (last.rsi14 != null) {
    const rsi = Number(last.rsi14);
    if (!Number.isNaN(rsi)) {
      if (rsi > 70) score -= 10;
      else if (rsi < 30) score += 10;
    }
  }

  if (returnPct > 10) score += 30;
  else if (returnPct > 0) score += 10;
  else if (returnPct < -10) score -= 30;

  score = Math.max(-100, Math.min(100, score));

  // label assignment
  let label = "Neutral";
  if (score >= 60) label = "Strongly Bullish";
  else if (score >= 20) label = "Bullish";
  else if (score <= -60) label = "Strongly Bearish";
  else if (score <= -20) label = "Bearish";

  // include latest indicator snapshots for UI convenience
  const indicatorsSnapshot = {
    sma20: last.sma20 != null ? Number(last.sma20) : null,
    ema20: last.ema20 != null ? Number(last.ema20) : null,
    rsi14: last.rsi14 != null ? Number(last.rsi14) : null
  };

  return {
    symbol: (candles[0] && candles[0].symbol) ? candles[0].symbol : null,
    startDate: candles[0] ? candles[0].date : null,
    endDate: candles[candles.length - 1] ? candles[candles.length - 1].date : null,
    returnPct,           // percentage, e.g. 3.45
    score,
    avgGain,             // fractional avg gain (e.g. 0.0023 -> 0.23% per-day average)
    avgLoss,             // fractional avg loss
    label,
    ...indicatorsSnapshot
  };
}

module.exports = { getMomentumSummary };
