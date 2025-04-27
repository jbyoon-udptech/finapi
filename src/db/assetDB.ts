import { queryFData } from "../api/fapi"
import { IAssetCfg, AssetCfg, IAssetData, AssetData } from "./asset.model"

export const loadAssetCfg = async (name: string): Promise<IAssetCfg | null> => {
  const doc = await AssetCfg.findOne({ name }).exec()
  if (!doc) {
    return null
  }
  return doc.toObject() as IAssetCfg
}

export const changeNameAssetCfg = async (asset: IAssetCfg) => {
  await AssetCfg.updateOne(
    { atype: asset.atype, ticker: asset.ticker },
    { $set: { name: asset.name } }
  )
}

export const saveAssetCfg = async (asset: IAssetCfg) => {
  const doc = new AssetCfg(asset)
  await doc.save()
}

export const loadAssetData = async (
  atype: string,
  ticker: string,
  date: string
): Promise<IAssetData | null> => {
  const doc = await AssetData.findOne({ atype, ticker, date }).exec()
  if (!doc) {
    return null
  }
  return doc.toObject() as IAssetData
}

// save asset to the database
export const saveAssetData = async (asset: IAssetData) => {
  await AssetData.updateOne(
    { atype: asset.atype, ticker: asset.ticker, date: asset.date },
    { $set: asset },
    { upsert: true }
  )
}

// query asset from the FAPI
export const queryAssetData = async (
  name: string,
  atype: string,
  ticker: string,
  date: string
): Promise<IAssetData | null> => {
  const fdata = await queryFData(atype, ticker, date)
  if (!fdata) {
    return null
  }
  return {
    name,
    atype,
    ticker,
    date,
    value: parseFloat(fdata.value),
    unit: fdata.currency,
  }
}

/**
 *  IAsset collection's  configuration
 * @param name string name of the asset. e.g. "TSLA"
 * @param atype string category of the asset. e.g. "stock", "crypto"
 * @param ticker string ticker of the asset. e.g. "TSLA", "BTC"
 */
class Asset {
  name: string
  atype: string
  ticker: string
  config: IAssetCfg | null

  constructor(name: string, atype: string, ticker: string) {
    this.name = name
    this.atype = atype
    this.ticker = ticker
    this.config = null
  }

  static async listCfg(): Promise<IAssetCfg[]> {
    return (await AssetCfg.find({})
      .sort({ atype: 1, name: 1 })
      .exec()) as IAssetCfg[]
  }

  static async saveCfg(cfg: IAssetCfg): Promise<IAssetCfg | null> {
    try {
      const doc = new AssetCfg(cfg)
      await doc.save()
      return doc.toObject() as IAssetCfg
    } catch (err) {
      console.error(`saveCfg error:`, err)
      return null
    }
  }

  async loadCfg(): Promise<IAssetCfg | null> {
    if (!this.config) {
      this.config = await loadAssetCfg(this.name)
    }
    if (this.config) {
      this.ticker = this.config.ticker
      this.atype = this.config.atype
    }
    return this.config
  }

  async loadData(date: string): Promise<IAssetData | null> {
    let data = await loadAssetData(this.atype, this.ticker, date)
    if (!data) {
      data = await queryAssetData(this.name, this.atype, this.ticker, date)
      if (data) {
        await saveAssetData(data)
      }
    }
    return data
  }
}
