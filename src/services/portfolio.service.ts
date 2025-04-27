import PortfolioModel, { PortfolioDocument } from "../models/portfolio.model"
import PortfolioSnapshotModel, {
  PortfolioSnapshotDocument,
} from "../models/portfolio-snapshot.model"
import AssetModel from "../models/asset.model"
import assetService from "./asset.service"
import { APIError } from "../utils/error-handler"
import { formatDate } from "../utils/timezone"

interface PortfolioAssetInput {
  asset_id: string
  date: string
  quantity: number
  value: number
  unit: string
}

interface PortfolioAssetChangeInput {
  asset_id: string
  date: string
  change: number
  value: number
  unit: string
}

const createPortfolio = async (name: string): Promise<PortfolioDocument> => {
  const portfolio = new PortfolioModel({ name })
  return await portfolio.save()
}

const addOrUpdateAssetToPortfolio = async (
  portfolioId: string,
  assetData: PortfolioAssetInput
): Promise<void> => {
  const portfolio = await PortfolioModel.findById(portfolioId)
  if (!portfolio) {
    throw new APIError("Portfolio not found", 404)
  }

  const snapshot = await PortfolioSnapshotModel.findOne({
    portfolio_id: portfolioId,
    date: new Date(assetData.date),
  })

  if (snapshot) {
    const existingAssetIndex = snapshot.assets.findIndex(
      (asset) => asset.asset_id === assetData.asset_id
    )
    if (existingAssetIndex > -1) {
      snapshot.assets[existingAssetIndex].quantity = assetData.quantity
      snapshot.assets[existingAssetIndex].value = assetData.value
      snapshot.assets[existingAssetIndex].unit = assetData.unit
    } else {
      const asset = await AssetModel.findById(assetData.asset_id)
      if (!asset) {
        throw new APIError("Asset not found", 400)
      }
      snapshot.assets.push({
        asset_id: asset.id,
        name: asset.name,
        ticker: asset.ticker,
        quantity: assetData.quantity,
        value: assetData.value,
        unit: assetData.unit,
      })
    }
    await snapshot.save()
  } else {
    const asset = await AssetModel.findById(assetData.asset_id)
    if (!asset) {
      throw new APIError("Asset not found", 400)
    }
    const newSnapshot = new PortfolioSnapshotModel({
      portfolio_id: portfolioId,
      date: new Date(assetData.date),
      assets: [
        {
          asset_id: asset.id,
          name: asset.name,
          ticker: asset.ticker,
          quantity: assetData.quantity,
          value: assetData.value,
          unit: assetData.unit,
        },
      ],
      total_portfolio_value: 0, // 초기값, 스냅샷 조회 시 업데이트
      timestamp: new Date(),
    })
    await newSnapshot.save()
  }
}

const getPortfolioSnapshotByDate = async (
  portfolioId: string,
  date: string
): Promise<PortfolioSnapshotDocument | null> => {
  const snapshot = await PortfolioSnapshotModel.findOne({
    portfolio_id: portfolioId,
    date: new Date(date),
  })
  if (!snapshot) {
    return null
  }

  // 외화 자산의 경우 원화 환산 가치를 포함
  let totalPortfolioValue = 0
  let totalPortfolioUnit = "KRW" // 기본 통화

  for (const asset of snapshot.assets) {
    let valueInKRW = asset.value
    if (asset.unit !== "KRW") {
      // 환율 정보 조회 및 변환 로직 필요
      const exchangeRateInfo = await assetService.getAssetDataByDate(
        `${asset.ticker}-KRW`,
        formatDate(date)
      )
      if (exchangeRateInfo) {
        valueInKRW = asset.value * exchangeRateInfo.value
      } else {
        console.warn(
          `Exchange rate for ${asset.unit} to KRW on ${date} not found.`
        )
        totalPortfolioUnit = "Mixed" // 환율 정보 없을 시 혼합 통화로 표시
      }
    }
    totalPortfolioValue += asset.quantity * valueInKRW
  }

  snapshot.total_portfolio_value = parseFloat(totalPortfolioValue.toFixed(2))
  snapshot.total_portfolio_unit = totalPortfolioUnit
  await snapshot.save() // 업데이트된 총 가치 저장

  return snapshot
}

const getPortfolioSnapshots = async (
  portfolioId: string
): Promise<
  {
    date: string
    total_portfolio_value: number
    total_portfolio_unit: string
  }[]
> => {
  const snapshots = await PortfolioSnapshotModel.find({
    portfolio_id: portfolioId,
  })
    .sort({ date: 1 })
    .select("date total_portfolio_value total_portfolio_unit -_id")
  return snapshots.map((snapshot) => ({
    date: formatDate(snapshot.date),
    total_portfolio_value: snapshot.total_portfolio_value,
    total_portfolio_unit: snapshot.total_portfolio_unit,
  }))
}

const createDailyPortfolioSnapshot = async (
  portfolioId: string,
  date: string
): Promise<void> => {
  const portfolio = await PortfolioModel.findById(portfolioId)
  if (!portfolio) {
    throw new APIError("Portfolio not found", 404)
  }

  const existingSnapshot = await PortfolioSnapshotModel.findOne({
    portfolio_id: portfolioId,
    date: new Date(date),
  })
  if (existingSnapshot) {
    console.log(
      `Snapshot already exists for portfolio ${portfolioId} on ${date}`
    )
    return
  }

  const latestSnapshot = await PortfolioSnapshotModel.findOne({
    portfolio_id: portfolioId,
    date: { $lte: new Date(date) },
  })
    .sort({ date: -1 })
    .limit(1)

  if (!latestSnapshot) {
    console.warn(
      `No previous snapshot found for portfolio ${portfolioId} on or before ${date}.`
    )
    return
  }

  let totalPortfolioValue = 0
  const updatedAssets: {
    asset_id: string
    name: string
    ticker: string
    quantity: number
    value: number
    unit: string
  }[] = []
  let portfolioUnit = "KRW" // 기본 통화

  for (const latestAsset of latestSnapshot.assets) {
    try {
      const currentAssetData = await assetService.getAssetDataByDate(
        latestAsset.asset_id,
        date
      )
      const valueInKRW =
        latestAsset.unit === "KRW"
          ? currentAssetData.value
          : await convertCurrency(
              currentAssetData.value,
              currentAssetData.currency,
              "KRW",
              date
            ) // 환율 변환 로직 필요
      totalPortfolioValue += latestAsset.quantity * valueInKRW
      updatedAssets.push({
        ...latestAsset,
        value: currentAssetData.value,
        unit: currentAssetData.currency,
      })
      if (latestAsset.unit !== "KRW") {
        portfolioUnit = "KRW" // 일단 KRW로 통일
      }
    } catch (error) {
      console.error(
        `Failed to get data for asset ${latestAsset.name} (${latestAsset.ticker}) on ${date}:`,
        error
      )
      // 에러 발생 시 해당 자산은 스냅샷에 포함하지 않거나, 이전 값 유지 등 정책 결정 필요
      updatedAssets.push(latestAsset) // 이전 정보 유지
      if (latestAsset.unit !== "KRW") {
        portfolioUnit = "Mixed"
      }
    }
  }

  const newSnapshot = new PortfolioSnapshotModel({
    portfolio_id: portfolioId,
    date: new Date(date),
    assets: updatedAssets,
    total_portfolio_value: parseFloat(totalPortfolioValue.toFixed(2)),
    total_portfolio_unit: portfolioUnit,
    timestamp: new Date(),
  })

  await newSnapshot.save()
}

// 환율 변환 함수 (별도 구현 필요)
const convertCurrency = async (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  date: string
): Promise<number> => {
  if (fromCurrency === toCurrency) {
    return amount
  }
  // 실제 환율 API 호출 및 캐싱 로직 구현 필요
  console.warn(
    `Currency conversion from ${fromCurrency} to ${toCurrency} on ${date} is not implemented.`
  )
  return amount // 임시로 변환 없이 반환
}

const getPortfolioList = async (): Promise<{ id: string; name: string }[]> => {
  const docs = await PortfolioModel.find({}).sort({ name: 1 })

  return docs.map((d) => ({
    id: d.id,
    name: d.name,
  }))
}

export default {
  getPortfolioList,
  createPortfolio,
  addOrUpdateAssetToPortfolio,
  getPortfolioSnapshotByDate,
  getPortfolioSnapshots,
  createDailyPortfolioSnapshot,
}
