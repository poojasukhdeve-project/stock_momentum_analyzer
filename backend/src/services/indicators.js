// backend/src/services/indicators.js
// Robust helper functions: SMA, EMA, RSI, and computeIndicators.
// This version ensures clean date formatting and defensive number handling.

/**
 * Simple Moving Average (SMA)
 */
function sma(values, window) {
  const result = new Array(values.length).fill(null);
  if (!Array.isArray(values) || values.length === 0 || window <= 0) return result;

  let sum = 0;

  for (let i = 0; i < values.length; i++) {
    const v = Number(values[i]);
    sum += isNaN(v) ? 0 : v;

    if (i >= window) {
      const outVal = Number(values[i - window]);
      sum -= isNaN(outVal) ? 0 : outVal;
    }

    result[i] = (i + 1 >= window) ? sum / window : null;
  }

  return result;
}

/**
 * Exponential Moving Average (EMA)
 */
function ema(values, window) {
  const result = new Array(values.length).fill(null);
  if (!Array.isArray(values) || values.length === 0 || window <= 0) return result;

  const k = 2 / (window + 1);
  let prev = null;
  let startIndex = -1;

  // find first numeric value to initialize EMA
  for (let i = 0; i < values.length; i++) {
    const v = Number(values[i]);
    if (!isNaN(v)) {
      prev = v;
      result[i] = prev;
      startIndex = i;
      break;
    } else {
      result[i] = null;
    }
  }

  if (prev === null) return result; // no numeric values at all

  // compute EMA for rest
  for (let i = startIndex + 1; i < values.length; i++) {
    const v = Number(values[i]);
    if (isNaN(v)) {
      result[i] = prev;   // carry previous EMA forward
      continue;
    }
    const cur = v * k + prev * (1 - k);
    result[i] = cur;
    prev = cur;
  }

  return result;
}

/**
 * Relative Strength Index (Wilder RSI)
 */
function rsi(values, period = 14) {
  const res = new Array(values.length).fill(null);
  if (!Array.isArray(values) || values.length < period + 1) return res;

  let gains = 0;
  let losses = 0;

  // initial window
  for (let i = 1; i <= period; i++) {
    const prev = Number(values[i - 1]);
    const curr = Number(values[i]);
    if (isNaN(prev) || isNaN(curr)) continue;

    const diff = curr - prev;
    gains += Math.max(0, diff);
    losses += Math.max(0, -diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // first RSI value
  const firstRS = avgGain / (avgLoss || 1e-10);
  res[period] = 100 - (100 / (1 + firstRS));

  // Wilder smoothing
  for (let i = period + 1; i < values.length; i++) {
    const prev = Number(values[i - 1]);
    const curr = Number(values[i]);
    if (isNaN(prev) || isNaN(curr)) {
      res[i] = res[i - 1] ?? null;
      continue;
    }

    const diff = curr - prev;
    const gain = Math.max(0, diff);
    const loss = Math.max(0, -diff);

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const rs = avgGain / (avgLoss || 1e-10);
    res[i] = 100 - (100 / (1 + rs));
  }

  return res;
}

/**
 * Compute all indicators and map back to candles.
 */
function computeIndicators(candles) {
  if (!Array.isArray(candles)) return [];

  const closes = candles.map(c => {
    const v = c && c.close !== undefined ? Number(c.close) : null;
    return (v === null || Number.isNaN(v)) ? null : v;
  });

  const sma20 = sma(closes, 20);
  const sma50 = sma(closes, 50);
  const ema20 = ema(closes, 20);
  const rsi14 = rsi(closes, 14);

  // attach indicators to candles
  return candles.map((c, i) => ({
    date:
      c && c.date
        ? (c.date instanceof Date
            ? c.date.toISOString().slice(0, 10)
            : String(c.date).slice(0, 10))
        : null,

    close: closes[i] !== null ? closes[i] : null,

    sma20: sma20[i] ?? null,
    sma50: sma50[i] ?? null,
    ema20: ema20[i] ?? null,
    rsi14: rsi14[i] ?? null
  }));
}

module.exports = { computeIndicators };
