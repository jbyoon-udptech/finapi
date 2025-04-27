import mongoose, { Document, Model } from "mongoose"

//////////////////////////
interface IAssetCfg {
  atype: string // "currency", "crypto", "KOSPI", "KOSDAQ", "NASDAQ", "NYSE"
                // atype&ticker의 조합으로 Data API를 호출한다.
  ticker: string // "ETH", "042660"
  name: string // "ETH", "한화오션". name은 ticker의 alias이다. 즉, ticker와 name은 동등하다. name은 UI용, ticker Data API용.
}

interface IAssetCfgDoc extends IAssetCfg, Document {}

const AssetCfgSchema = new mongoose.Schema<IAssetCfgDoc>({
  atype: {
    type: String,
    enum: ["currency", "crypto", "KOSPI", "KOSDAQ", "NASDAQ", "NYSE"],
    required: true,
  },
  ticker: { type: String, required: true },
  name: { type: String, required: true, unique: true },
})
const AssetCfg: Model<IAssetCfgDoc> = mongoose.model(
  "assetCfg",
  AssetCfgSchema
)

//////////////////////////
interface IAssetData {
  atype: string // "currency" | "crypto" | "KOSPI"| "KOSDAQ" | "NASDAQ" | "NYSE", asset type
  name: string // "ETH", "한화오션". name은 ticker의 alias이다. 즉, ticker와 name은 동등하다.
  ticker: string // "ETH", "042660"
  date: string // "2024-10-10"
  value: number // 2300
  unit: string // "USD". value를 어떤 단위로 표시하는지. "USD", "KRW"
}

interface IAssetDataDoc extends IAssetData, Document {}

// Schemas and Models
const AssetDataSchema = new mongoose.Schema<IAssetDataDoc>({
  atype: {
    type: String,
    enum: ["currency", "crypto", "KOSPI", "KOSDAQ", "NASDAQ", "NYSE"],
    required: true,
  },
  name: { type: String, required: true },
  ticker: { type: String, required: true },
  date: { type: String, required: true },
  value: { type: Number, required: true },
  unit: { type: String, required: true },
})

AssetDataSchema.index({ atype: 1, ticker: 1, date: 1 }, { unique: true })

const AssetData: Model<IAssetDataDoc> = mongoose.model("asset", AssetDataSchema)

export { IAssetCfg, AssetCfg, IAssetData, AssetData }
