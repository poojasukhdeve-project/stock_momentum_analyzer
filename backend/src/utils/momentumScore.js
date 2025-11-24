function getMomentumSummary(candles, indicators){
  if(!candles.length) return null;
  const last = indicators[indicators.length-1];
  const first = indicators[0];
  const returnPct = ((last.close - first.close) / first.close) * 100;
  let score = 0;
  if(last.sma50 && last.close > last.sma50) score += 30;
  if(last.ema20 && last.close > last.ema20) score += 20;
  if(last.rsi14){
    if(last.rsi14 > 70) score += 10;
    else if(last.rsi14 < 30) score -= 10;
  }
  if(returnPct > 10) score += 30;
  else if(returnPct > 0) score += 10;
  else if(returnPct < -10) score -= 30;
  score = Math.max(-100, Math.min(100, score));
  let label='Neutral';
  if(score >= 60) label='Strongly Bullish';
  else if(score >= 20) label='Bullish';
  else if(score <= -60) label='Strongly Bearish';
  else if(score <= -20) label='Bearish';
  return {
    symbol: candles[0].symbol || null,
    startDate: candles[0].date,
    endDate: candles[candles.length-1].date,
    returnPct,
    score,
    label
  };
}
module.exports = { getMomentumSummary };
