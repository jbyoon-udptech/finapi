import { getModelForClass, index, modelOptions, prop } from "@typegoose/typegoose"
import { ObjectId } from "mongoose"

@index({ category: 1, symbol: 1, unit: 1 }, { unique: true })
@modelOptions({ schemaOptions: { collection: "assetlist" } })
export class AssetList {
  @prop({
    required: true,
    enum: ["yf", "currency", "crypto", "KOSPI", "KOSDAQ", "NASDAQ", "NYSE"],
  })
  public category!: string

  @prop({ required: true })
  public name!: string // yf:ETH, KOSPI:한화오션, yf:한화오션, yf:USDKRW

  @prop({ required: true })
  public symbol!: string // "ETH", "042660", "042660.KS", "USDKRW=X"

  @prop({ required: true })
  public unit!: string // "USD", "KRW", "KRW", "JPY"
}

const AssetListModel = getModelForClass(AssetList, { schemaOptions: { versionKey: false } })

@index({ _assetId: 1, date: 1 })
@modelOptions({ schemaOptions: { collection: "assetprice" } })
export class AssetPrice {
  @prop({ required: true, ref: () => AssetList })
  public _assetId!: ObjectId // ObjectId of the asset. e.g. yf:TSLR, Crypto:ETH, "KOSPI:한화오션

  @prop({ required: true })
  public date!: string // "2024-10-10"

  @prop({ required: true })
  public value!: number // 2300

  @prop()
  public unit!: string // asset unit, e.g., "USD", "KRW", "JPY"
}

const AssetPriceModel = getModelForClass(AssetPrice)

export { AssetListModel, AssetPriceModel }
