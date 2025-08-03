import { DateTime } from "luxon"

import { loadNupdateAssetPrice } from "./asset.ctrl"

import {
  PortfolioAssetRecord,
  PortfolioAssetRecordModel,
  PortfolioList,
  PortfolioListModel,
} from "./portfolio.model"

export const updatePortfolioAssetRecord = async (asset: PortfolioAssetRecord) => {
  await PortfolioAssetRecordModel.updateOne(
    { _pfId: asset._pfId, _assetId: asset._assetId, date: asset.date },
    { $set: asset },
    { upsert: true }
  )
}

export const loadPortfolioAssetRecords = async (
  _pfId: string,
  date: string,
  condition: string = "eq"
): Promise<PortfolioAssetRecord[] | null> => {
  const qry: {
    _pfId: string
    date: string | { $lte?: string; $gte?: string }
  } = { _pfId, date }
  if (condition == "lte") {
    qry.date = { $lte: date }
  } else if (condition == "gte") {
    qry.date = { $gte: date }
  } else {
    qry.date = date
  }
  const data = await PortfolioAssetRecordModel.find(qry).sort({ date: 1 })
  if (!data) {
    return null
  }
  return data.map(d => d.toObject()) as PortfolioAssetRecord[]
}

// Update portfolio for the given date
const updatePortfolioforDate = async (
  portfolio: PortfolioList & { _id: any },
  date: DateTime,
  force: boolean = false
) => {
  const pfName = portfolio.name
  const strDate = date.toFormat("yyyy-MM-dd")
  try {
    console.info(`updatePortfolio[${pfName}, ${strDate}] start`)
    const assetRecords = await loadPortfolioAssetRecords(
      portfolio._id.toHexString(),
      strDate,
      "lte"
    )
    if (!assetRecords?.length) {
      throw new Error(`Portfolio ${pfName} not found for date ${strDate}`)
    }

    // update price and result value of asset records
    const totalAssets: Map<string, number> = new Map() // <id, result value of the date>
    for (const ar of assetRecords) {
      const assetId = ar._assetId.toString()
      const theDateResult = (totalAssets.get(assetId) || 0) + ar.change
      totalAssets.set(assetId, theDateResult)
      if (ar.result !== theDateResult) {
        const ap = await loadNupdateAssetPrice(assetId, strDate, force)
        if (ap) {
          ar.price = ap.value
          ar.unit = ap.unit
          ar.result = theDateResult
          console.info(
            `updatePortfolioAssetRecord[${assetId}, ${strDate}]: ${ar.change} ${ar.result} ${ar.price} ${ar.unit}`
          )
        } else {
          console.warn(`No asset data found for ${assetId} on ${strDate}`)
        }
        await updatePortfolioAssetRecord(ar)
      }
    }

    console.info(`updatePortfolio[${pfName}, ${strDate}] done`)
  } catch (error) {
    console.error(`Error in updatePortfolio[${pfName}, ${strDate}]`, error)
  }
}

// Runs every day at midnight
export const updatePortfolioAll = async (date: DateTime, force: boolean = false) => {
  try {
    console.info("updatePortfolioAll start")
    const allPortfolioList = await PortfolioListModel.find()
    for (const pf of allPortfolioList) {
      await updatePortfolioforDate(pf, date, force)
    }
    console.info("updatePortfolioAll executed successfully")
  } catch (error) {
    console.error("updatePortfolioAll error:", error)
  }
}

// Cron job to update all portfolios
export const cronUpdatePortfolioAll = async (now: DateTime) => {
  try {
    console.info(`${now} : Cron job executed successfully`)
    await updatePortfolioAll(now, true)
  } catch (error) {
    console.error("Error executing cron job", error)
  }
}
