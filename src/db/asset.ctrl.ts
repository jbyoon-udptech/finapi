import mongoose from "mongoose"

import { requestFData } from "../api/fapi"
import { AssetListModel, AssetPrice, AssetPriceModel } from "./asset.model"

/**
 * Load asset price from the database. (cached data)
 */
export const loadAssetPrice = async (assetId: string, date: string): Promise<AssetPrice | null> => {
  const data = await AssetPriceModel.findOne({ _assetId: assetId, date }).exec()
  if (!data) {
    return null
  }
  return data.toObject() as AssetPrice
}

/**
 * Update asset price in the database. (cached data)
 */
export const updateAssetPrice = async (
  assetId: string,
  date: string,
  value: number,
  unit: string
) => {
  const asset = { _assetId: assetId, date: date, value: value, unit: unit }
  await AssetPriceModel.updateOne(
    { _assetId: asset._assetId, date: date },
    { $set: asset },
    { upsert: true }
  )
}

/**
 * Load cached asset price
 */
export const loadNupdateAssetPrice = async (
  assetId: string,
  date: string,
  force: boolean = false
): Promise<AssetPrice | null> => {
  let data: AssetPrice | null = null

  try {
    const asset = await AssetListModel.findById(assetId).exec()
    if (!asset) {
      console.warn(`Asset with ID ${assetId} not found`)
      return null
    }

    data = await loadAssetPrice(assetId, date)
    if (force || !data) {
      const fdata = await requestFData(asset.category, asset.symbol, date)
      if (!fdata) {
        return data
      }
      data = {
        _assetId: new mongoose.Schema.Types.ObjectId(assetId),
        date: date,
        value: fdata.value,
        unit: fdata.currency,
      }
      await updateAssetPrice(assetId, date, data.value, data.unit)
    }
  } catch (error) {
    console.error(`Error loading or updating asset price for ${assetId} on ${date}:`, error)
    return null
  }

  return data
}
