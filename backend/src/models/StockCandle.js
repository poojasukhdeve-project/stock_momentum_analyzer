const mongoose = require('mongoose');
const stockCandleSchema = new mongoose.Schema({
  symbol:{ type:String, required:true, index:true },
  date:{ type:Date, required:true, index:true },
  open:Number, high:Number, low:Number, close:Number, volume:Number
});
stockCandleSchema.index({ symbol:1, date:1 }, { unique:true });
module.exports = mongoose.model('StockCandle', stockCandleSchema);
