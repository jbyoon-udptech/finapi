import { DateTime } from "luxon"
import { fetchAndCache, EFResponseBase } from "./external-data.utils"
import { formatDate } from "../../utils/timezone"

interface UpbitResponse {
  time: number
  close: number
}

interface EFResponse extends EFResponseBase {}

// https://min-api.cryptocompare.com/data/v2/histoday?fsym=BTC&tsym=USD&toTs=1745280000
export const fetchUpbitData = (ticker: string, date: string): Promise<EFResponse> => {
  const cacheKey = `ef:upbit:${ticker}:${date}`
  const toTs = new Date(`${date}T00:00+0900`).getTime() / 1000
  const url = `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${ticker}&tsym=USD&toTs=${toTs}`

  const parser = (
    res: { data: UpbitResponse[] },
    category: string, // "upbit"
    ticker: string, // ticker "KRWBTC"
    _d: string // date "2023-10-01"
  ): EFResponse | undefined => {
    if (res.data?.length > 0) {
      const lastitem = res.data[res.data.length - 1]
      const tradeDateTime = DateTime.fromMillis(lastitem.time * 1000)
      return {
        category,
        ticker,
        date,
        value: lastitem.close,
        unit: "KRW",
        timestamp: tradeDateTime?.toISO() || "",
      }
    }
    return undefined
  }

  return fetchAndCache<UpbitResponse[], EFResponse>(cacheKey, url, parser)
}

export default fetchUpbitData;