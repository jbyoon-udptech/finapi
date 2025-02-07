import { DateTime } from "luxon"
import {
  IPortfolioCfg,
  PortfolioCfg,
  IPortfolio,
  Portfolio,
} from "./portfolio.model"

export const savePortfoliio = async (
  name: String,
  date: String,
  values: Map<string, number>
) => {
  await Portfolio.updateOne(
    { name, date },
    { $set: { name, date, values } },
    { upsert: true }
  )
}

export const getPortfolio = async (
  name: string,
  date: string
): Promise<IPortfolio | null> => {
  const data = await Portfolio.findOne({ date, name })
  if (!data) {
    return null
  }
  return data.toObject() as IPortfolio
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