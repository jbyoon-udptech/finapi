import { getModelForClass, prop, index, modelOptions } from "@typegoose/typegoose"
import { ObjectId } from "mongoose"

@index({ category: 1, ticker: 1, unit: 1 }, { unique: true })
@modelOptions({ schemaOptions: { collection: "assetlist" } })
export class AssetList {
  @prop({
    required: true,
    enum: ["currency", "crypto", "KOSPI", "KOSDAQ", "NASDAQ", "NYSE"],
  })
  public category!: string // "currency" | "crypto" | "KOSPI"| "KOSDAQ" | "NASDAQ" | "NYSE"

  @prop({ required: true })
  public name!: string // "ETH", "한화오션"

  @prop({ required: true })
  public ticker!: string // "ETH", "042660"

  @prop({ required: true })
  public unit!: string // "USD"

  @prop()
  public source?: string // "Upbit", "Binance"
}

const AssetListModel = getModelForClass(AssetList, { schemaOptions: { versionKey: false } })

@index({ _assetId: 1, date: 1 })
@modelOptions({ schemaOptions: { collection: "assetprice" } })
export class AssetPrice {
  @prop({ required: true, ref: () => AssetList })
  public _assetId!: ObjectId // ObjectId of the asset. e.g. "Crypto/ETH", "KOSPI/한화오션"

  @prop({ required: true })
  public date!: string // "2024-10-10"

  @prop({ required: true })
  public value!: number // 2300

  @prop()
  public unit!: string // "USD"
}

const AssetPriceModel = getModelForClass(AssetPrice)

export { AssetListModel, AssetPriceModel }
