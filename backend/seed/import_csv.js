// backend/seed/import_csv.js  (robust version)
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const StockCandle = require('../src/models/StockCandle');

const tickers = ['AAPL','MSFT','TSLA','AMZN','GOOGL'];

function parseDateSafe(raw) {
  if (!raw && raw !== 0) return null;
  // trim and remove quotes / BOM
  let s = String(raw).trim().replace(/^\uFEFF/, '').replace(/^"|"$/g, '');
  if (!s) return null;

  // Common ISO YYYY-MM-DD already OK:
  // Try direct Date parse first
  let d = new Date(s);
  if (!isNaN(d.getTime())) return d;

  // Try swapping common dd-mm-yyyy or mm/dd/yyyy variants:
  // If looks like dd-mm-yyyy or dd/mm/yyyy
  const dashMatch = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if (dashMatch) {
    const [ , p1, p2, p3 ] = dashMatch;
    // if p1 > 12 treat as dd-mm-yyyy -> convert to yyyy-mm-dd
    if (Number(p1) > 12) {
      const iso = `${p3.padStart(4,'0')}-${p2.padStart(2,'0')}-${p1.padStart(2,'0')}`;
      d = new Date(iso);
      if (!isNaN(d.getTime())) return d;
    } else {
      // assume mm-dd-yyyy
      const iso = `${p3.padStart(4,'0')}-${p1.padStart(2,'0')}-${p2.padStart(2,'0')}`;
      d = new Date(iso);
      if (!isNaN(d.getTime())) return d;
    }
  }

  // Try removing milliseconds, timezone junk
  s = s.replace(/\.\d+Z?$/, '');
  d = new Date(s);
  if (!isNaN(d.getTime())) return d;

  return null;
}

async function importTicker(ticker) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, `sample_${ticker}.csv`);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${filePath}, skipping ${ticker}`);
      return resolve({ imported: 0, skipped: 0, missing: true });
    }

    const rows = [];
    const skippedRows = [];
    let rowIndex = 0;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        rowIndex++;
        try {
          const d = parseDateSafe(data.date);
          if (!d) {
            skippedRows.push({ row: rowIndex, reason: 'invalid date', raw: data.date });
            return;
          }

          const open = data.open === '' || data.open === undefined ? null : Number(data.open);
          const high = data.high === '' || data.high === undefined ? null : Number(data.high);
          const low = data.low === '' || data.low === undefined ? null : Number(data.low);
          const close = data.close === '' || data.close === undefined ? null : Number(data.close);
          const volume = data.volume === '' || data.volume === undefined ? 0 : Number(data.volume);

          // Only import rows with a numeric close value (optional)
          if (close === null || Number.isNaN(close)) {
            skippedRows.push({ row: rowIndex, reason: 'invalid close', raw: data.close });
            return;
          }

          rows.push({
            symbol: ticker,
            date: d,
            open, high, low, close, volume
          });
        } catch (err) {
          skippedRows.push({ row: rowIndex, reason: 'exception', raw: err.message });
        }
      })
      .on('end', async () => {
        try {
          let count = 0;
          for (const r of rows) {
            await StockCandle.updateOne(
              { symbol: r.symbol, date: r.date },
              { $set: r },
              { upsert: true }
            );
            count++;
          }
          console.log(`Imported ${count} rows for ${ticker} (skipped ${skippedRows.length})`);
          if (skippedRows.length) {
            console.log(` Skipped rows for ${ticker}:`, skippedRows.slice(0,10));
            if (skippedRows.length > 10) console.log(` ...and ${skippedRows.length - 10} more`);
          }
          resolve({ imported: count, skipped: skippedRows.length, skippedRows });
        } catch (err) {
          reject(err);
        }
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser:true, useUnifiedTopology:true });
    console.log('MongoDB connected');

    for (const t of tickers) {
      const res = await importTicker(t);
      // continue even if some ticker missing/data bad
    }

    console.log('All done');
    process.exit(0);
  } catch (err) {
    console.error('Import error:', err);
    process.exit(1);
  }
}

main();
