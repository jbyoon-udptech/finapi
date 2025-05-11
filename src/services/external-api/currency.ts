import { DateTime } from "luxon"
import { fetchAndCache, EFResponseBase } from "./external-data.utils"

interface CurrencyResponse {
  cur_unit: string
  deal_bas_r: string
}

interface EFResponse extends EFResponseBase {}

/*
`https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=kafcch9C4fr3kjWiRMGlWzDOblqWqtln&searchdate=${toYYYYMMDD(date)}&data=AP01`

[
  {
    "result": 1,
    "cur_unit": "AED",
    "ttb": "384.51",
    "tts": "392.28",
    "deal_bas_r": "388.4",
    "bkpr": "388",
    "yy_efee_r": "0",
    "ten_dd_efee_r": "0",
    "kftc_bkpr": "388",
    "kftc_deal_bas_r": "388.4",
    "cur_nm": "아랍에미리트 디르함"
  },
  {
    "result": 1,
    "cur_unit": "AUD",
    "ttb": "918.65",
    "tts": "937.2",
    "deal_bas_r": "927.93",
    "bkpr": "927",
    "yy_efee_r": "0",
    "ten_dd_efee_r": "0",
    "kftc_bkpr": "927",
    "kftc_deal_bas_r": "927.93",
    "cur_nm": "호주 달러"
  },
  ...
]
*/

const fetchCurrencyData = (
  ticker: string,
  date: string,
  noCache: boolean = false
): Promise<EFResponse> => {
  const cacheKey = `extapi:currency:${ticker}:${date}`
  const strYYYYMMDD = date.replace(/-/g, "") // YYYYMMDD 형식으로 변환
  const url = `https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=kafcch9C4fr3kjWiRMGlWzDOblqWqtln&searchdate=${strYYYYMMDD}&data=AP01`

  const parser = (
    response: { data: CurrencyResponse[] },
    category: string,
    ticker: string,
    date: string
  ): EFResponse | undefined => {
    const kSrcCurrency = ticker.slice(0, 3) // "USDKRW" => "USD"
    const kDstCurrency = ticker.slice(3) // "USDKRW" => "KRW"
    const item = response?.data?.filter((d) => d.cur_unit === kSrcCurrency)
    if (item?.length > 0) {
      return {
        category,
        date,
        ticker,
        timestamp: DateTime.fromISO(date).toISO() || "",
        value: Number(item[0].deal_bas_r.replace(/,/g, "")),
        unit: kDstCurrency,
      }
    }
    return undefined
  }

  return fetchAndCache<CurrencyResponse[], EFResponse>(
    cacheKey,
    url,
    parser,
    noCache
  )
}

export default fetchCurrencyData
