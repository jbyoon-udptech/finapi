import mongoose, { Document, Model } from "mongoose"

interface IPortfolioCfg {
  name: string // name of the portfolio. e.g. "JB's Portfolio"
  assets: string[] // list of assets in the portfolio. e.g. ["BTC", "ETH"]
}

interface IPortfolioDoc extends IPortfolioCfg, Document {}

const PortfolioCfgSchema = new mongoose.Schema<IPortfolioDoc>({
  name: { type: String, required: true },
  assets: { type: [String], required: true },
})

const PortfolioCfg: Model<IPortfolioDoc> = mongoose.model(
  "portfolioCfg",
  PortfolioCfgSchema
)

interface IPortfolioData extends Document {
  name: string // name of the portfolio. e.g. "JB's Portfolio"
  date: string // date of the portfolio. e.g. "2021-01-01"
  values: Map<string, number> // values of the assets in the portfolio. e.g. { "BTC": 10000, "ETH": 2000 }
}

interface IPortfolioDoc extends IPortfolioData, Document {}

const PortfolioSchema = new mongoose.Schema<IPortfolioDoc>({
  name: { type: String, required: true },
  date: { type: String, required: true },
  values: { type: Map, of: Number, required: true },
})

PortfolioSchema.index({ name: 1, date: 1 });

const PortfolioData: Model<IPortfolioDoc> = mongoose.model(
  "portfolio",
  PortfolioSchema
)

export { IPortfolioCfg, PortfolioCfg, IPortfolioData, PortfolioData }
