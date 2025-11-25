// backend/src/models/StockCandle.js
const mongoose = require('mongoose');

const stockCandleSchema = new mongoose.Schema({
  symbol: { type: String, required: true, index: true },
  date: { type: Date, required: true, index: true },
  open: { type: Number, default: null },
  high: { type: Number, default: null },
  low: { type: Number, default: null },
  close: { type: Number, default: null },
  volume: { type: Number, default: 0 }
}, {
  timestamps: true, // adds createdAt and updatedAt
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// unique index on symbol + date
stockCandleSchema.index({ symbol: 1, date: 1 }, { unique: true });

// keep symbol uppercase for consistency
stockCandleSchema.pre('save', function(next) {
  if (this.symbol && typeof this.symbol === 'string') {
    this.symbol = this.symbol.toUpperCase();
  }
  next();
});

module.exports = mongoose.model('StockCandle', stockCandleSchema);
