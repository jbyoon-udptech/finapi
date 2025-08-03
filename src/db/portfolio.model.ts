import { getModelForClass, prop, index, modelOptions } from "@typegoose/typegoose"
import { ObjectId } from "mongoose"

import { AssetList } from "./asset.model"

/*
  PortfolioList samples
  e.g.
  {
    name: "JB's Portfolio"
    currency: "KRW",
    timezone: "Asia/Seoul"
  },
*/

@modelOptions({ schemaOptions: { collection: "portfoliolist" } })
export class PortfolioList {
  @prop({ required: true, unique: true })
  public name!: string // name of the portfolio. e.g. "JB's Portfolio"

  @prop({ required: true, default: "KRW" })
  public currency!: string // currency of the portfolio. e.g. "KRW", "USD", "EUR"

  @prop({ required: true, default: "Asia/Seoul" })
  public timezone!: string // timezone of the portfolio. e.g. "Asia/Seoul"
}

// PortfloioList는 여러개의 포트폴리오 목록을 관리하는 모델이다.
export const PortfolioListModel = getModelForClass(PortfolioList, {
  schemaOptions: { versionKey: false },
})

/*
  portfolioAssetRecord samples
  change record of the portfolio's assets.
  e.g.
  {
    _pfId: 1234567809 // "JB's Portfolio"
    _assetId: 32432432, // ETH
    date: "2025-01-01",
    change: 3.1, // (prev)4 + 3.1 ETH
    result: 7.1, // total number of the asset of the date. == sum of all changes
  },
  {
    _pfId: 1234567809, // "JB's Portfolio"
    _assetId: 12345, // 한화오션
    date: "2025-01-08",
    change: 300, // (prev)500 +300 한화오션
    result: 800,
  },
  {
    _pfId: 1234567809, // "JB's Portfolio"
    _assetId: 12345, // 한화오션
    date: "2025-01-18",
    change: -100, // (prev)800 -100 한화오션
    result: 700,
  }
*/

@index({ _pfId: 1, date: 1, _assetId: 1 })
@modelOptions({ schemaOptions: { collection: "portfolioassetrecord" } })
export class PortfolioAssetRecord {
  @prop({ required: true, ref: () => PortfolioList })
  public _pfId!: ObjectId // ObjectId of the portfolioList. e.g. "JB's Portfolio"

  @prop({ required: true, ref: () => AssetList })
  public _assetId!: ObjectId // ObjectId of the asset. e.g. "Crypto/ETH", "KOSPI/한화오션"

  @prop({ required: true })
  public date!: string // target date. e.g. "2021-01-01"

  @prop({ required: true })
  public change!: number // changed number of the asset. e.g. 10, -5

  @prop({ default: 0 })
  public result!: number // total number of the asset of the date. == sum of all changes

  @prop({ default: 0 })
  public price!: number // asset price of the date. e.g. 2300, 50000

  @prop({ default: "" })
  public unit!: string // asset price of the date. e.g. "KRW", "USD"

  @prop({ default: "" })
  public memo!: string // memo. e.g. "Bought 10 ETH at 2300 USD"
}

// PortfolioAssetRecord는 포트폴리오내의 자산들의 일별 변화를 저장하고 있는 모델이다.
export const PortfolioAssetRecordModel = getModelForClass(PortfolioAssetRecord)
