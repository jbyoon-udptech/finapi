import axios from "axios"
import { IAsset, Asset } from "./asset.model"

// save asset to the database
export const saveAsset = async (asset: IAsset) => {
  const nAsset = new Asset(asset)
  await nAsset.save()
}

// load asset from the database
export const loadAsset = async (
  assetName: string,
  date: string
): Promise<IAsset | null> => {
  const data = await Asset.findOne({ date, name: assetName }).exec()
  if (!data) {
    return null
  }
  return data.toObject() as IAsset
}

/**
 * load asset value from db if it exists, otherwise fetch from external API
 * @param name asset name
 * @param date date in YYYY-MM-DD format
 */
export const queryAsset = async (
  name: string,
  date: string
): Promise<IAsset | null> => {
  const response = await axios.get(
    `https://api.example.com/asset/${asset}?date=${
      date.toISOString().split("T")[0]
    }`
  )
}

/**
 *  IAsset collection's configuration
 */
class AssetCfg {
  name: string
  type: string
  ticker: string

  constructor(name: string, type: string, ticker: string) {
    this.name = name
    this.type = type
    this.ticker = ticker
  }
  toString(): string {
    return `${this.name} (${this.type}) - Ticker: ${this.ticker}`
  }

  load(): Promise<IAsset | null> {
    return loadAsset(this.name, new Date().toISOString().split("T")[0])
  }
  save(asset: IAsset): Promise<void> {
    return saveAsset(asset)
  }
  get(date: string): Promise<IAsset | null> {
    return getAsset(this.name, date)
  }
}
