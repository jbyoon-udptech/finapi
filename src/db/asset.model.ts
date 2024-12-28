import mongoose, { Document, Model } from "mongoose"

interface IAsset extends Document {
  name: string
  type: "currency" | "crypto" | "stock"
  date: Date
  value: number
}

// Schemas and Models
const AssetSchema = new mongoose.Schema<IAsset>({
  name: { type: String, required: true },
  type: { type: String, enum: ["currency", "crypto", "stock"], required: true },
  date: { type: Date, required: true },
  value: { type: Number, required: true },
})

const Asset: Model<IAsset> = mongoose.model("asset", AssetSchema)

export { IAsset, Asset }
