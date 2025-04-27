// import { IAsset, Asset } from "./asset.model"

// export const saveAsset = async (asset: IAsset) => {
//   const nAsset = new Asset(asset)
//   await nAsset.save()
// }

// export const loadAsset = async (
//   assetName: string,
//   date: string
// ): Promise<IAsset | null> => {
//   const response = await axios.get(
//     `https://api.example.com/asset/${asset}?date=${
//       currentDate.toISOString().split("T")[0]
//     }`
//   )
// }

// /**
//  * Load asset from the database
//  * @param assetName
//  * @param date
//  * @returns
//  */
// export const getAsset = async (
//   assetName: string,
//   date: string
// ): Promise<IAsset | null> => {
//   const data = await Asset.findOne({ date, name: assetName }).exec()
//   if (!data) {
//     return null
//   }
//   return data.toObject() as IAsset
// }


// /**
//  *  IAsset collection's  configuration
//  */
// class AssetCfg {
//   name: string
//   type: string
//   ticker: string

//   constructor(name: string, type: string, ticker: string) {
//     this.name = name
//     this.type = type
//     this.ticker = ticker
//   }
// }

