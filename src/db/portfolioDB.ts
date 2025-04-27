import { DateTime } from "luxon"
import {
  IPortfolioCfg,
  PortfolioCfg,
  IPortfolioData,
  PortfolioData,
} from "./portfolio.model"

export const getPortfolioCfg = async (
  name: string,
): Promise<IPortfolioCfg | null> => {
  const doc = await PortfolioCfg.findOne({ name })
  if (!doc) {
    return null
  }
  return doc.toObject() as IPortfolioCfg
}

export const savePortfoliioCfg = async (
  name: String,
  assets: string[]
) => {
  await PortfolioCfg.updateOne(
    { name },
    { $set: { name, assets } },
    { upsert: true }
  )
}

export const loadPortfolioData = async (
  name: string,
  date: string
): Promise<IPortfolioData | null> => {
  const doc = await PortfolioData.findOne({ name, date })
  if (!doc) {
    return null
  }
  return doc.toObject() as IPortfolioData
}

export const savePortfoliioData = async (
  name: String,
  date: String,
  values: Map<string, number>
) => {
  await PortfolioData.updateOne(
    { name, date },
    { $set: { name, date, values } },
    { upsert: true }
  )
}

class Portfolio {
  name: string
  assets: string[]
  portfolioCfg: IPortfolioCfg | null

  constructor(name: string) {
    this.name = name
    this.assets = []
    this.portfolioCfg = null
  }

  async loadCfg(): Promise<IPortfolioCfg | null> {
    if (!this.portfolioCfg) {
      this.portfolioCfg = await getPortfolioCfg(this.name)
    }
    if (this.portfolioCfg) {
      this.assets = this.portfolioCfg.assets
      // load assets from the database
      for (const asset of this.assets) {
        const data = await loadPortfolioData(this.name, asset)
        if (data) {
          console.log(`loadPortfolioData[${this.name}, ${asset}]`, data)
        } else {
          console.error(`loadPortfolioData[${this.name}, ${asset}] failed`)
        }
      }
    }
    return this.portfolioCfg
  }

  async createCfg(name:string, assets: string[]): Promise<IPortfolioCfg | null> {
    this.name = name
    this.assets = assets
    await savePortfoliioCfg(this.name, assets)
    this.portfolioCfg = await getPortfolioCfg(this.name)
    return this.portfolioCfg
  }


  async updateData(date: DateTime) {
    const strDate = date.toFormat("yyyy-MM-dd")
    try {
      // load asset from API with portfolio.assets and date
      const values: Map<string, number> = new Map()
      for (const asset of this.assets) {
        const data = await loadAsset(asset, strDate)
        values.set(asset, data)
      }
      await savePortfoliio(portfolioCfg.name, strDate, values)
      console.info(`updatePortfolioSingle[${portfolioCfg.name}, ${strDate}] done`)
    } catch (error) {
      console.error(
        `Error in updatePortfolioSingle[${portfolioCfg.name}, ${strDate}]`,
        error
      )
    }
  }
}

const updatePortfolioSingle = async (
  portfolioCfg: IPortfolioCfg,
  date: DateTime
) => {
  const strDate = date.toFormat("yyyy-MM-dd")
  try {
    // load asset from API with portfolio.assets and date
    const values: Map<string, number> = new Map()
    for (const asset of portfolioCfg.assets) {
      const data = await loadAsset(asset, strDate)
      values.set(asset, data)
    }
    await savePortfoliio(portfolioCfg.name, strDate, values)
    console.info(`updatePortfolioSingle[${portfolioCfg.name}, ${strDate}] done`)
  } catch (error) {
    console.error(
      `Error in updatePortfolioSingle[${portfolioCfg.name}, ${strDate}]`,
      error
    )
  }
}

// Runs every day at midnight
// date: "2021-01-01"
export const updatePortfolioAll = async (date: DateTime) => {
  try {
    const portfolioCfgs = await PortfolioCfg.find()
    for (const portfolio of portfolioCfgs) {
      await updatePortfolioSingle(portfolio, date)
    }
    console.log("updatePortfolio executed successfully")
  } catch (error) {
    console.error("Error executing updatePortfolio", error)
  }
}

/*
export const getPortfolioAll = async (date: string) => {
  const currentDate = new Date()
  // Runs every day at midnight
  try {
    const portfolios = await Portfolio.find()
    for (const portfolio of portfolios) {
      const values: Map<string, number> = new Map()
      for (const asset of portfolio.assets) {
        const response = await axios.get(
          `https://api.example.com/asset/${asset}?date=${
            currentDate.toISOString().split("T")[0]
          }`
        )
        values.set(asset, response.data.value)
      }
      portfolio.date = currentDate
      portfolio.values = values
      await portfolio.save()
    }
    console.log("Cron job executed successfully")
  } catch (error) {
    console.error("Error executing cron job", error)
  }
}
*/