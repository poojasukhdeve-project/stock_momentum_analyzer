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
    const fromDate = new Date(); fromDate.setDate(fromDate.getDate() - range);
    const candles = await StockCandle.find({ symbol, date:{ $gte: fromDate } }).sort({ date:1 }).lean();
    const indicators = computeIndicators(candles);
    const summary = getMomentumSummary(candles, indicators);
    res.json(summary);
  }catch(err){
    console.error(err); res.status(500).json({ message:'Server error' });
  }
});

module.exports = router;
