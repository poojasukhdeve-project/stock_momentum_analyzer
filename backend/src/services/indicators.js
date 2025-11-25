// backend/src/services/indicators.js
// Improved and robust indicator helpers: SMA, EMA, RSI, and computeIndicators
// - Defensive against short arrays / missing values
// - EMA initialized from first data point
// - RSI uses Wilder-style smoothing and avoids divide-by-zero

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

    // only produce SMA when we have `window` elements
    if (i + 1 >= window) {
      result[i] = sum / window;
    } else {
      result[i] = null;
    }
  }

  return result;
}

function ema(values, window) {
  const result = new Array(values.length).fill(null);
  if (!Array.isArray(values) || values.length === 0 || window <= 0) return result;

  const k = 2 / (window + 1);

  // initialize prev as the first valid numeric value
  let prev = null;
  for (let i = 0; i < values.length; i++) {
    const v = Number(values[i]);
    if (!isNaN(v)) {
      prev = v;
      result[i] = prev; // first numeric value becomes the first EMA value
      break;
    } else {
      result[i] = null;
    }
  }

  if (prev === null) return result; // no numeric values at all

  // continue computing EMA from the next index
  for (let i = result.indexOf(prev) + 1; i < values.length; i++) {
    const v = Number(values[i]);
    if (isNaN(v)) {
      // if current value is invalid, carry forward previous EMA (or set null)
      result[i] = prev;
      continue;
    }
    const cur = v * k + prev * (1 - k);
    result[i] = cur;
    prev = cur;
  }

  return result;
}

function rsi(values, period = 14) {
  // Returns array same length as values with nulls until RSI is available
  const res = new Array(values.length).fill(null);
  if (!Array.isArray(values) || values.length === 0 || period <= 0) return res;
  if (values.length < 2) return res;

  // compute initial gains and losses for the first `period` steps
  let gains = 0;
  let losses = 0;
  let validCount = 0;

  // we need at least period+1 samples to compute the first RSI value using Wilder smoothing
  for (let i = 1; i < values.length; i++) {
    const prev = Number(values[i - 1]);
    const curr = Number(values[i]);
    if (isNaN(prev) || isNaN(curr)) {
      // skip this pair
      continue;
    }

    const change = curr - prev;
    if (i <= period) {
      gains += Math.max(0, change);
      losses += Math.max(0, -change);
      validCount++;
      // only compute first RSI when we've processed exactly 'period' intervals
      if (i === period) {
        const avgGain = gains / period;
        const avgLoss = losses / period;
        const rs = avgGain / (avgLoss || 1e-10);
        res[i] = 100 - (100 / (1 + rs));
        // store smoothed values in variables and continue with Wilder smoothing
        var smoothedGain = avgGain;
        var smoothedLoss = avgLoss;
      }
    } else {
      // Wilder smoothing: smoothed = (prev_smoothed * (period-1) + current_gain) / period
      const gain = Math.max(0, change);
      const loss = Math.max(0, -change);
      smoothedGain = (smoothedGain * (period - 1) + gain) / period;
      smoothedLoss = (smoothedLoss * (period - 1) + loss) / period;
      const rs = smoothedGain / (smoothedLoss || 1e-10);
      res[i] = 100 - (100 / (1 + rs));
    }
  }

  return res;
}

function computeIndicators(candles) {
  if (!Array.isArray(candles)) return [];

  const closes = candles.map(c => {
    // be defensive and coerce numbers
    const v = c && (c.close !== undefined ? Number(c.close) : null);
    return (v === null || Number.isNaN(v)) ? null : v;
  });

  // compute indicators
  const sma20 = sma(closes, 20);
  const sma50 = sma(closes, 50);
  const ema20 = ema(closes, 20);
  const rsi14 = rsi(closes, 14);

  // map back to candles with indicator fields (null if not available)
  return candles.map((c, i) => ({
    date: c && c.date ? c.date : null,
    close: closes[i] !== null ? closes[i] : null,
    sma20: sma20[i] !== undefined ? sma20[i] : null,
    sma50: sma50[i] !== undefined ? sma50[i] : null,
    ema20: ema20[i] !== undefined ? ema20[i] : null,
    rsi14: rsi14[i] !== undefined ? rsi14[i] : null
  }));
}

module.exports = { computeIndicators };
