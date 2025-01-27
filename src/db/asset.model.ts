import mongoose, { Document, Model } from "mongoose"

interface IAsset {
  type: string // "currency" | "crypto" | "KOSPI"| "KOSDAQ" | "NASDAQ" | "NYSE"
  name: string // "ETH", "한화오션"
  ticker: string // "ETH", "042660"
  date: string // "2024-10-10"
  value: number // 2300
  unit: string // "USD"
}

interface IAssetDocument extends IAsset, Document {}

// Schemas and Models
const AssetSchema = new mongoose.Schema<IAssetDocument>({
  type: {
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

const Asset: Model<IAssetDocument> = mongoose.model("asset", AssetSchema)

export { IAsset, Asset }
