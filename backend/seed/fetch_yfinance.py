import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import os

TICKERS = ["AAPL", "MSFT", "TSLA", "AMZN", "GOOGL"]

OUTPUT_DIR = os.path.dirname(__file__)

end_date = datetime.today()
start_date = end_date - timedelta(days=365)

for ticker in TICKERS:
    print(f"Fetching {ticker} data...")

    df = yf.download(
        ticker,
        start=start_date.strftime("%Y-%m-%d"),
        end=end_date.strftime("%Y-%m-%d"),
        progress=False
    )

    if df.empty:
        print(f"❌ No data for {ticker}")
        continue

    df.reset_index(inplace=True)
    df = df[["Date", "Open", "High", "Low", "Close", "Volume"]]
    df.columns = ["date", "open", "high", "low", "close", "volume"]

    file_path = os.path.join(OUTPUT_DIR, f"sample_{ticker}.csv")
    df.to_csv(file_path, index=False)

    print(f"✅ Saved {file_path}")

print("🎉 All stock data fetched successfully!")
