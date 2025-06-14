import { DateTime } from "luxon"
import {
  IPortfolioList,
  PortfolioList,
  IPortfolioHistory,
  PortfolioHistory,
} from "./portfolio.model"

export const savePortfoliio = async (pf: IPortfolioHistory) => {
  await PortfolioHistory.updateOne(
    { name: pf.name, date: pf.date },
    { $set: pf },
    { upsert: true }
  )
}

export const loadPortfolio = async (
  name: string,
  date: string,
  condition: string = "eq"
): Promise<IPortfolioHistory | null> => {
  const qry: { name: string; date: string | { $lte?: string; $gte?: string } } =
    { name, date }
  if (condition == "lte") {
    qry.date = { $lte: date }
  } else if (condition == "gte") {
    qry.date = { $gte: date }
  } else {
    qry.date = date
  }
  const data = await PortfolioHistory.findOne(qry)
  if (!data) {
    return null
  }
  return data.toObject() as IPortfolioHistory
}

const updatePortfolioSingle = async (
  portfolio: IPortfolioList,
  date: DateTime,
  force: boolean = false
) => {
  const pfName = portfolio.name
  const strDate = date.toFormat("yyyy-MM-dd")
  let pf: IPortfolioHistory | null = null
  try {
    pf = await loadPortfolio(pfName, strDate, "lte")
    if (pf) {
      if (pf.date === strDate && force === false) {
        console.info(
          `updatePortfolioSingle[${pfName}, ${strDate}] already exists`
        )
        return
      }
    } else {
      throw new Error(`Portfolio ${pfName} not found for date ${strDate}`)
    }

    // update portfolio with new date

    // load asset from API with portfolio.assets and date
    const values: Map<string, number> = new Map()
    for (const asset of pf.assets) {
      const data = await queryAsset(asset.name, strDate)
      values.set(asset, data)
    }
    await savePortfoliio(pfName, strDate, values)
    console.info(`updatePortfolioSingle[${pfName}, ${strDate}] done`)
  } catch (error) {
    console.error(
      `Error in updatePortfolioSingle[${pfName}, ${strDate}]`,
      error
    )
  }
}

// Runs every day at midnight
// date: "2021-01-01"
export const updatePortfolioAll = async (date: DateTime) => {
  try {
    const allPortfolioList = await PortfolioList.find()
    for (const portfolio of allPortfolioList) {
      await updatePortfolioSingle(portfolio, date)
    }
    console.info("updatePortfolioAll executed successfully")
  } catch (error) {
    console.error("Error executing updatePortfolioAll", error)
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
