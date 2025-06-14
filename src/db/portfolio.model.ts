import mongoose, { Document, Model } from "mongoose"

interface IPortfolioList extends Document {
  name: string // name of the portfolio. e.g. "JB's Portfolio"
  currency: string // currency of the portfolio. e.g. "KRW", "USD", "EUR"
}

const PortfolioListSchema = new mongoose.Schema<IPortfolioList>({
  name: { type: String, required: true, unique: true },
  currency: { type: String, required: true, default: "KRW" },
})

// PortfloioList는 포트폴리오의 목록을 관리하는 모델이다.
const PortfolioList: Model<IPortfolioList> = mongoose.model(
  "portfolioList",
  PortfolioListSchema
)

/*
  asset history of the portfolio.
  e.g.
  {
    name: "JB's Portfolio",
    date: "2025-01-01",
    assets: [
      { name: "BTC", count: 10 },
      { name: "ETH", count: 15 },
      { name: "한화오션", count: 200 },
    ],
  },
  {
    name: "JB's Portfolio",
    date: "2025-01-08",
    assets: [
      { name: "BTC", count: 10 },
      { name: "ETH", count: 15 },
      { name: "한화오션", count: 300 },
    ]
  }
*/
interface IPortfolioHistory extends Document {
  name: string // name of the portfolioList. e.g. "JB's Portfolio"
  date: string // target date. e.g. "2021-01-01"
  assets: [
    {
      name: string // name of the asset. e.g. "BTC", "ETH", "KOSPI-한화오션"
      count: number // number of the asset. e.g. 10, 15, 20
    }
  ]
}

const PortfolioHistorySchema = new mongoose.Schema<IPortfolioHistory>({
  name: { type: String, required: true },
  date: { type: String, required: true },
  assets: [
    {
      name: { type: String, required: true },
      count: { type: Number, required: true },
    },
  ],
})

PortfolioHistorySchema.index({ name: 1, date: 1 }, { unique: true })

// 일별로 potfolio의 자산을 저장하고 있는 모델이다.
const PortfolioHistory: Model<IPortfolioHistory> = mongoose.model(
  "portfolio",
  PortfolioHistorySchema
)

export { IPortfolioList, PortfolioList, IPortfolioHistory, PortfolioHistory }
