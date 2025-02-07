import { getFData } from "../api/fapi"
import { IAsset, Asset } from "./asset.model"

export const saveAsset = async (asset: IAsset) => {
  const nAsset = new Asset(asset)
  await nAsset.save()
}

export const loadAsset = async (
  type: string,
  ticker: string,
  date: string
): Promise<{ value: string; unit: string } | null> => {
  const fdata = await getFData(type, ticker, date)
  return { value: fdata.value, unit: fdata.currency }
}

/**
 * Load asset from the database
 * @param assetName
 * @param date
 * @returns
 */
export const getAsset = async (
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
 *  IAsset collection's  configuration
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

  async get(date: string): Promise<IAsset | null> {
    let value = await getAsset(this.name, date)
    if (!value) {
      const data = await loadAsset(this.name, this.type, date)
      if (data) {
        value = {
          name: this.name,
          type: this.type,
          ticker: this.ticker,
          date,
          value: parseFloat(data.value),
          unit: data.unit,
        }
        await saveAsset(value)
      }
    }
    return value
  }
}
