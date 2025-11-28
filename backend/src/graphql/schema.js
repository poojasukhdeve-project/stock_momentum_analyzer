const { buildSchema } = require('graphql');

module.exports = buildSchema(`
  type Candle {
    date: String!
    open: Float
    high: Float
    low: Float
    close: Float
    volume: Float
  }

  type MomentumSummary {
    symbol: String!
    startDate: String!
    endDate: String!
    # returnPct is expressed as PERCENTAGE (e.g. 3.6 means 3.6%)
    returnPct: Float
    score: Float
    avgGain: Float
    avgLoss: Float
    label: String
  }

  type Query {
    candles(symbol: String!, from: String, to: String): [Candle]!
    momentum(symbol: String!, range: Int): MomentumSummary
  }
`);
