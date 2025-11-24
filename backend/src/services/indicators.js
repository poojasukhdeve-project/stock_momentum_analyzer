function sma(values, window){
  const result = [];
  for(let i=0;i<values.length;i++){
    if(i+1 < window){ result.push(null); continue; }
    const sum = values.slice(i+1-window, i+1).reduce((a,b)=>a+b,0);
    result.push(sum/window);
  }
  return result;
}

function ema(values, window){
  const k = 2/(window+1);
  const result = [];
  let prev = values[0] || 0;
  for(let i=0;i<values.length;i++){
    if(i===0){ result.push(prev); continue; }
    const cur = values[i]*k + prev*(1-k);
    result.push(cur);
    prev = cur;
  }
  return result;
}

function rsi(values, period=14){
  const res = [];
  let gains=0, losses=0;
  for(let i=0;i<values.length;i++){
    if(i===0){ res.push(null); continue; }
    const change = values[i] - values[i-1];
    gains += Math.max(0, change);
    losses += Math.max(0, -change);
    if(i < period){ res.push(null); continue; }
    if(i === period){
      gains /= period; losses /= period;
    } else {
      gains = (gains*(period-1) + Math.max(0, change)) / period;
      losses = (losses*(period-1) + Math.max(0, -change)) / period;
    }
    const rs = gains / (losses || 1e-6);
    res.push(100 - (100/(1+rs)));
  }
  return res;
}

function computeIndicators(candles){
  const closes = candles.map(c=>c.close);
  const sma20 = sma(closes,20);
  const sma50 = sma(closes,50);
  const ema20 = ema(closes,20);
  const rsi14 = rsi(closes,14);
  return candles.map((c,i)=>({
    date: c.date,
    close: c.close,
    sma20: sma20[i]||null,
    sma50: sma50[i]||null,
    ema20: ema20[i]||null,
    rsi14: rsi14[i]||null
  }));
}

module.exports = { computeIndicators };
