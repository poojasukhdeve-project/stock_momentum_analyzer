# Stock Momentum Analyzer

A full-stack financial analytics dashboard that turns raw stock market data into interactive momentum insights, technical indicators, and comparative visualizations — built to make market analysis accessible without prior financial expertise.

**Author:** Pooja Sukhdeve — Master's Student, Computer Science, Boston University Metropolitan College

---

## Overview

Beginner investors typically bounce between multiple tools to understand a single stock: one site for prices, another for charts, another for RSI, another for news. That fragmentation makes market analysis slow and confusing for anyone who isn't already fluent in financial jargon.

Stock Momentum Analyzer consolidates that workflow into a single dashboard. It computes technical indicators (SMA, EMA, RSI), scores momentum, visualizes price and volume trends, and lets users compare multiple companies side by side — all through a clean, beginner-friendly interface.

---

## Problem Statement

Existing stock analysis platforms tend to have:

- Complex, cluttered interfaces
- Paywalled or subscription-only features
- Heavy reliance on financial jargon
- Little support for visual/beginner learning

This project set out to build something simpler: a free, visual-first dashboard that surfaces the indicators that matter and explains market behavior at a glance.

---

## Features

| Feature | Description |
|---|---|
| **Momentum Dashboard** | Momentum score, return %, bullish/bearish signal, RSI, average gains/losses |
| **Price Trend Charts** | Interactive line charts for close price, SMA20, and EMA20 to spot trend direction and reversals |
| **Volume Analysis** | Bar charts showing trading volume and participation |
| **Market Comparison** | Side-by-side comparison across AAPL, MSFT, TSLA, AMZN, GOOGL |
| **Technical Indicators** | Backend-computed SMA20, EMA20, and RSI14 |

---

## System Architecture

**Frontend** — React.js, Recharts, Axios, CSS
Renders charts and dashboards, handles API calls, displays indicators and market data.

**Backend** — Node.js, Express.js, MongoDB, Mongoose
Processes stock data, computes indicators, serves REST APIs, manages database operations.

**Database** — MongoDB
Stores historical OHLCV (open, high, low, close, volume) candle data.

```
stock_momentum_analyzer/
│
├── backend/
│   └── src/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       └── index.js
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── App.jsx
│
└── README.md
```

---

## How It Works: Example Workflow

1. User selects a stock (e.g., AAPL)
2. Dashboard fetches historical data from the backend
3. Backend computes SMA, EMA, RSI, and momentum score
4. Frontend renders price, volume, and indicator charts
5. Momentum summary card gives an at-a-glance read on trend strength

For AAPL specifically, the dashboard surfaces a long-term bullish price trend, SMA20/EMA20 crossovers marking trend continuation points, RSI readings flagging overbought/oversold zones, and volume spikes correlating with periods of heavier trading activity.

---

## Key Challenges & Solutions

Building this project surfaced several real debugging and design problems worth documenting:

### 1. Volume data silently disappearing
**Problem:** Volume bars weren't rendering anywhere on the dashboard.
**Root cause:** `computeIndicators()` was transforming OHLC data for SMA/EMA/RSI but dropping the `volume` field in the process — it wasn't being carried through to the output.
**Fix:** Refactored the service to explicitly preserve `open`, `high`, `low`, `close`, and `volume` alongside the computed indicator fields.
**Takeaway:** Data transformation pipelines need explicit field-preservation checks — it's easy for a "compute X" function to accidentally become a "compute X and lose everything else" function.

### 2. Inconsistent date formats breaking charts
**Problem:** CSV datasets from different sources used inconsistent date formats, which broke chart rendering and time-series alignment.
**Fix:** Built a normalization layer that parses and standardizes all incoming dates before they hit the database.
**Takeaway:** Real-world data is messy by default — normalization at the ingestion boundary saves a lot of downstream pain.

### 3. Charts overflowing on smaller screens
**Problem:** Large Recharts components caused layout overflow on smaller viewports.
**Fix:** Implemented responsive containers and CSS layout adjustments so charts resize correctly across screen sizes.
**Takeaway:** Charting libraries need explicit responsive configuration — they don't gracefully handle constrained space by default.

### 4. Indicator calculations breaking on bad data
**Problem:** Missing or invalid price values caused SMA/EMA/RSI calculations to return incorrect or `NaN` results.
**Fix:** Added validation and fallback logic so indicators degrade gracefully instead of silently producing wrong numbers.
**Takeaway:** Financial calculations need defensive coding — a wrong number that looks plausible is more dangerous than an obvious crash.

---

## What I Learned

**Frontend:** React component architecture, financial chart rendering with Recharts, responsive dashboard design, state management.

**Backend:** REST API design, MongoDB/Mongoose integration, building data-processing pipelines, systematic backend debugging.

**Financial Analytics:** How SMA, EMA, and RSI are calculated and interpreted; what momentum scoring actually captures; how to visualize market behavior meaningfully.

**Full-Stack Integration:** Keeping frontend and backend in sync, handling real API communication, and debugging issues that span both layers rather than living in one file.

---

## Tech Stack

| Category | Technology |
|---|---|
| Frontend | React.js |
| Charts | Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| HTTP Client | Axios |
| Styling | CSS |

---

## Getting Started

**Clone the repo**
```bash
git clone <repository-url>
```

**Backend setup**
```bash
cd backend
npm install
npm run dev
```

**Frontend setup**
```bash
cd frontend
npm install
npm run dev
```

**Environment variables** — create a `.env` file in `backend/`:
```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

---

## Future Enhancements

- Real-time stock price APIs
- AI-powered price predictions
- Portfolio tracking and management
- News sentiment analysis
- Candlestick chart view
- User authentication
- Watchlist feature
- Cloud deployment

---

## Why This Project

This was primarily a learning exercise in fetching, processing, and visualizing real-world data end to end — not a production trading tool. It's a useful reference point for:

- Portfolio / academic project
- FinTech case study
- Practicing full-stack data pipelines and dashboard design
