import mongoose, { Document, Model, ObjectId } from "mongoose"

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
  asset change history of the portfolio.
  e.g.
  {
    name: "JB's Portfolio",
    date: "2025-01-01",
    asset: {
      name: "BTC",
      count: 10 ,
      price: 150000,
    },
  },
  {
    name: "JB's Portfolio",
    date: "2025-01-08",
    asset: {
      name: "한화오션",
      count: 300 ,
      price: 100000,
    },
  },
  {
    name: "JB's Portfolio",
    date: "2025-01-18",
    asset: {
      name: "한화오션",
      count: -100 ,
      price: 100000,
    },
  }
*/
interface IPortfolioRecord {
  _pfId: ObjectId // ObjectId of the portfolioList. e.g. "JB's Portfolio"
  date: string // target date. e.g. "2021-01-01"

  _assetId: ObjectId // ObjectId of the asset. e.g. "BTC", "ETH", "KOSPI-한화오션"
  change: number // changed number of the asset. e.g. 10, -5
  price: number // price of the asset. e.g. 100000, 1000000
}

interface IPortfolioDoc extends IPortfolioRecord, Document {}

const PortfolioSchema = new mongoose.Schema<IPortfolioDoc>({
  _pfId: { type: mongoose.Schema.Types.ObjectId, required: true },
  date: { type: String, required: true },

  _assetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  change: { type: Number, required: true },
  price: { type: Number, required: true },
})

PortfolioSchema.index({ _pfId: 1, date: 1 }, { unique: true })

// 일별로 potfolio의 자산을 저장하고 있는 모델이다.
const Portfolio: Model<IPortfolioDoc> = mongoose.model(
  "portfolio",
  PortfolioSchema
)

export { IPortfolioList, PortfolioList, IPortfolioDoc, Portfolio }
