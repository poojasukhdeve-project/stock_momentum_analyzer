const { buildSchema } = require('graphql');
module.exports = buildSchema(`
  type Candle { date: String!, open: Float, high: Float, low: Float, close: Float, volume: Float }
  type MomentumSummary { symbol: String!, startDate: String, endDate: String, returnPct: Float, score: Int, label: String }
  type Query {
    candles(symbol: String!, from: String, to: String): [Candle!]!
    momentum(symbol: String!, range: Int!): MomentumSummary
  }
`);
