import { IAsset, Asset } from "./asset.model"

export const saveAsset = async (asset: IAsset) => {
  const nAsset = new Asset(asset)
  await nAsset.save()
}

export const getAsset = async (
  date: string,
  assetName: string
): Promise<IAsset | null> => {
  const data = await Asset.findOne({ date, name: assetName }).exec()
  if (!data) {
    return null
  }
  return data.toObject() as IAsset
}
