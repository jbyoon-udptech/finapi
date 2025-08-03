import { DateTime } from "luxon"
import { loadNupdateAssetPrice } from "./asset.ctrl"
import {
  PortfolioList,
  PortfolioListModel,
  PortfolioAssetRecord,
  PortfolioAssetRecordModel,
} from "./portfolio.model"

/**
 * 특정 포트폴리오의 구간 데이터를 불러오기
 * in: portfolioName: string, from: DateTime, to: DateTime
 * out: PortfolioAssetRecord[] | null
 */
export const loadPortfolioAssetRecords = async (
  portfolioName: string,
  from: DateTime, // from <= DateTime < to
  to: DateTime
): Promise<PortfolioAssetRecord[] | null> => {
  try {
    const pf = await PortfolioListModel.findOne({
      name: portfolioName,
    }).exec()
    if (!pf) {
      return null
    }

    const assetRecords = await PortfolioAssetRecordModel.find({
      _pfId: pf._id,
      date: {
        $gte: from.toFormat("yyyy-MM-dd"),
        $lt: to.toFormat("yyyy-MM-dd"),
      },
    })
      .sort({ date: 1 })
      .exec()
    if (!assetRecords || assetRecords.length === 0) {
      return null
    }
    return assetRecords.map(d => d.toObject()) as PortfolioAssetRecord[]
  } catch (error) {
    console.error(`Error loading portfolio[${portfolioName}]`, error)
    return null
  }
}

/**
 * 특정 포트폴리오의 구간 데이터를 불러오기
 * in: portfolioName: string, from: DateTime, to: DateTime
 * out:

export const queryPortfolio = async (
  portfolioName: string,
  from: DateTime, // from <= DateTime < to
  to: DateTime
): Promise<null> => {
  const records = await loadPortfolioAssetRecords(portfolioName, from, to)
  if (!records || records.length === 0) {
    return null
  }
  // 해당 AssetRecord의 result에 date price 값을 추가한다.
  for (const record of records) {
    console.log(record)
    const ap = await loadNupdateAssetPrice(
      record._assetId.toString(),
      record.date,
      false
    )
    if (ap) {
      record.price = ap.value
      record.unit = ap.unit
    } else {
      console.warn(
        `No asset price found for ${record._assetId} on ${record.date}`
      )
    }
  }

  return null
}
*/
