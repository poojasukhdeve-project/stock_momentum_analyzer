function getMomentumSummary(candles, indicators) {
  // If no price data at all → only then return null
  if (!candles || candles.length === 0) return null;

  const last = indicators[indicators.length - 1];
  const first = indicators[0];

  // If first or last candle missing, return null
  if (!last || !first) return null;

  // Safe return percentage
  const returnPct =
    first.close === 0
      ? 0
      : ((last.close - first.close) / first.close) * 100;

  let score = 0;

  // No SMA50 requirement anymore
  // SMA20 optional scoring
  if (last.sma20 != null && last.close > last.sma20) score += 20;

  // EMA20 optional scoring
  if (last.ema20 != null && last.close > last.ema20) score += 20;

  // RSI scoring (optional)
  if (last.rsi14 != null) {
    if (last.rsi14 > 70) score -= 10;
    else if (last.rsi14 < 30) score += 10;
  }

  // Return percentage scoring
  if (returnPct > 10) score += 30;
  else if (returnPct > 0) score += 10;
  else if (returnPct < -10) score -= 30;

  // Limit score
  score = Math.max(-100, Math.min(100, score));

  // Label assignment
  let label = "Neutral";
  if (score >= 60) label = "Strongly Bullish";
  else if (score >= 20) label = "Bullish";
  else if (score <= -60) label = "Strongly Bearish";
  else if (score <= -20) label = "Bearish";

  return {
    symbol: candles[0].symbol || null,
    startDate: candles[0].date,
    endDate: candles[candles.length - 1].date,
    returnPct,
    score,
    label,
  };
}

module.exports = { getMomentumSummary };
