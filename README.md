# 📈 Stock Momentum Analyzer – AI-Driven Market Intelligence Dashboard

A full-stack financial analytics platform that transforms raw stock market data into interactive visual insights using technical indicators, momentum analytics, and responsive dashboard visualization.

---

# 🚀 Project Story

In today’s fast-moving financial world, investors constantly struggle to understand market behavior.

Most beginners visit multiple websites every day:

- One website for stock prices
- Another for technical charts
- Another for RSI indicators
- Another for financial news

This process becomes overwhelming and inefficient.

The goal of this project was simple:

> Build a single intelligent dashboard where users can visually understand stock momentum and market trends in seconds.

The Stock Momentum Analyzer was designed to solve this challenge by combining:

- Financial analytics
- Technical indicators
- Interactive charts
- Momentum scoring
- Comparative market analysis

into one modern and beginner-friendly dashboard.

---

# 🎯 Problem Statement

Traditional stock analysis platforms often suffer from:

- Complex user interfaces
- Expensive subscriptions
- Difficult financial terminology
- Poor beginner accessibility
- Lack of visual learning tools

Investors need:

✅ Simple dashboards  
✅ Visual market insights  
✅ Technical indicators  
✅ Momentum analysis  
✅ Fast decision-making support

This project was developed to create a clean and responsive financial analytics system capable of transforming stock market data into actionable visual intelligence.

---

# 💡 Proposed Solution

The solution was to develop a full-stack stock analytics dashboard capable of:

- Displaying stock price trends
- Computing technical indicators
- Visualizing volume analytics
- Comparing multiple companies
- Generating momentum insights

The platform provides a visual experience for understanding market behavior without requiring advanced financial knowledge.

---

# 🏗 System Architecture

## Frontend

Built using:

- React.js
- Recharts
- Axios
- CSS

### Responsibilities

- Render charts
- Display analytics dashboard
- Handle API requests
- Show technical indicators
- Visualize market data

---

## Backend

Built using:

- Node.js
- Express.js
- MongoDB
- Mongoose

### Responsibilities

- Process stock market data
- Compute indicators
- Serve REST APIs
- Handle database operations
- Generate momentum analytics

---

## Database

MongoDB stores historical stock candle data including:

- Open price
- High price
- Low price
- Close price
- Trading volume

---

# 📊 Features

## ✅ Momentum Dashboard

Displays:

- Momentum score
- Return percentage
- Bullish/Bearish trend
- RSI analytics
- Average gains/losses

---

## ✅ Price Trend Visualization

Interactive line charts display:

- Close prices
- SMA20
- EMA20

This helps users visually identify:

- Uptrends
- Downtrends
- Trend reversals

---

## ✅ Volume Bar Chart

The dashboard includes trading volume analysis with visual bar charts.

Volume helps investors understand:

- Market activity
- Trading participation
- Bullish vs bearish pressure

---

## ✅ Market Comparison

Users can compare multiple companies:

- AAPL
- MSFT
- TSLA
- AMZN
- GOOGL

The comparison dashboard helps identify stronger-performing stocks.

---

## ✅ Technical Indicators

The backend computes:

### SMA20
Simple Moving Average over 20 trading days.

### EMA20
Exponential Moving Average for trend sensitivity.

### RSI14
Relative Strength Index for momentum analysis.

---

# 🔍 Case Study Example

## Scenario

An investor wants to analyze Apple stock performance over the past year.

### Workflow

1. User selects AAPL
2. Dashboard loads historical stock data
3. Backend computes indicators
4. Charts visualize market behavior
5. Momentum summary provides analytics insights

---

## Dashboard Observations

### 📈 Price Trend
The dashboard shows long-term bullish movement.

### 📊 SMA20 & EMA20
Moving averages help identify trend continuation.

### 📉 RSI Analysis
RSI helps identify:

- Overbought zones
- Oversold zones
- Momentum strength

### 📦 Volume Analysis
Volume bars highlight periods of heavy market participation.

---

# ⚙️ Technical Workflow

## Step 1 – Data Collection

Historical stock data is imported from CSV datasets.

---

## Step 2 – Database Storage

The backend stores stock candle data in MongoDB.

---

## Step 3 – Indicator Computation

The backend computes:

- SMA
- EMA
- RSI
- Momentum analytics

---

## Step 4 – API Layer

Express APIs serve processed financial analytics.

---

## Step 5 – Frontend Visualization

React components render charts and financial dashboards.

---

# 🧩 Challenges Faced

## 1. Volume Chart Rendering Issue

Initially, volume bars were not visible because the indicator service removed volume fields during data transformation.

### Solution

The `computeIndicators()` service was updated to preserve:

- open
- high
- low
- close
- volume

---

## 2. Date Formatting Problems

CSV datasets contained inconsistent date formats.

### Solution

Robust date normalization and formatting logic was implemented.

---

## 3. Responsive Dashboard Layout

Large charts caused UI overflow issues.

### Solution

Responsive layout design and Recharts container optimization were implemented.

---

## 4. Technical Indicator Accuracy

Financial calculations required defensive handling of invalid values.

### Solution

Validation and fallback logic were added for all indicators.

---

# 📈 Learning Outcomes

This project strengthened understanding of:

## Frontend Development

- React component architecture
- Financial chart rendering
- Responsive dashboard design
- State management

---

## Backend Development

- REST API development
- MongoDB integration
- Data processing pipelines
- Backend debugging

---

## Financial Analytics

- Technical indicators
- Momentum analysis
- Market visualization
- Financial statistics

---

## Full-Stack Integration

- API communication
- Frontend/backend synchronization
- Real-world debugging workflows

---

# 🛠 Technologies Used

| Category | Technology |
|---|---|
| Frontend | React.js |
| Charts | Recharts |
| Backend | Node.js |
| Framework | Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| HTTP Client | Axios |
| Styling | CSS |

---

# 📁 Project Structure

```bash
stock_momentum_analyzer/
│
├── backend/
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── index.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│
└── README.md
```

---
# ▶️ Installation Guide

## Clone Repository

```bash
git clone <repository-url>
```

---

## Backend Setup

```bash
cd backend
npm install
npm run dev
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
