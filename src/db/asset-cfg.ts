import axios from "axios"
import { Asset, AssetModel } from "./asset.model"
import { getAsset } from "./asset.ctrl"

// save asset to the database
export const saveAsset = async (asset: Asset) => {
  const nAsset = new AssetModel(asset)
  await nAsset.save()
}

// load asset from the database
export const loadAsset = async (
  assetName: string,
  date: string
): Promise<Asset | null> => {
  const data = await AssetModel.findOne({ date, name: assetName }).exec()
  if (!data) {
    return null
  }
  return data.toObject() as Asset
}

/**
 * load asset value from db if it exists, otherwise fetch from external API
 * @param name asset name
 * @param date date in YYYY-MM-DD format
 */
export const queryAsset = async (
  name: string,
  date: string
): Promise<Asset | null> => {
  // First try to load from database
  const existingAsset = await loadAsset(name, date)
  if (existingAsset) {
    return existingAsset
  }

  // If not found, fetch from external API (commented out for now)
  /*
  const response = await axios.get(
    `https://api.example.com/asset/${name}?date=${date}`
  )
  // Process response and save to database
  */

  return null
}

/**
 *  Asset collection's configuration
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

  load(): Promise<Asset | null> {
    return loadAsset(this.name, new Date().toISOString().split("T")[0])
  }
  save(asset: Asset): Promise<void> {
    return saveAsset(asset)
  }
  get(date: string): Promise<Asset | null> {
    return getAsset(this.name, date)
  }
}
