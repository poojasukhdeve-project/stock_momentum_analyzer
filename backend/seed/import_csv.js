const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const StockCandle = require('../src/models/StockCandle');

async function main(){
  await mongoose.connect(process.env.MONGO_URI);
  const filePath = path.join(__dirname, 'sample_aapl.csv');
  const rows = [];
  fs.createReadStream(filePath).pipe(csv()).on('data', data => {
    rows.push({
      symbol: 'AAPL',
      date: new Date(data.date),
      open: parseFloat(data.open), high: parseFloat(data.high),
      low: parseFloat(data.low), close: parseFloat(data.close),
      volume: parseInt(data.volume,10)
    });
  }).on('end', async ()=>{
    for(const r of rows){
      await StockCandle.updateOne({ symbol: r.symbol, date: r.date }, r, { upsert: true });
    }
    console.log('CSV import done'); process.exit(0);
  });
}
main();
