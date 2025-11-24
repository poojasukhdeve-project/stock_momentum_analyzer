const StockCandle = require('../models/StockCandle');
const { computeIndicators } = require('../services/indicators');
const { getMomentumSummary } = require('../utils/momentumScore');

module.exports = {
  candles: async ({ symbol, from, to }) => {
    const q = { symbol: symbol.toUpperCase() };
    if (from || to) { q.date = {}; if (from) q.date.$gte = new Date(from); if (to) q.date.$lte = new Date(to); }
    const docs = await StockCandle.find(q).sort({ date: 1 }).lean();
    return docs.map(d=>({ date: d.date.toISOString().slice(0,10), open: d.open, high:d.high, low:d.low, close:d.close, volume:d.volume }));
  },
  momentum: async ({ symbol, range }) => {
    const fromDate = new Date(); fromDate.setDate(fromDate.getDate() - range);
    const docs = await StockCandle.find({ symbol: symbol.toUpperCase(), date: { $gte: fromDate } }).sort({ date:1 }).lean();
    const indicators = computeIndicators(docs);
    const summary = getMomentumSummary(docs, indicators);
    if(!summary) return null;
    return { ...summary, startDate: summary.startDate.toISOString().slice(0,10), endDate: summary.endDate.toISOString().slice(0,10) };
  }
};
