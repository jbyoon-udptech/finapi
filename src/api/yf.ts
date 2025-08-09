import axios from "axios"
import { Request, Response, Router } from "express"
import { DateTime } from "luxon"

export const catergory = "yf"

const getTickerCurrency = (symbol: string) => {
  let currency = "USD"
  const tickerCurrency = [
    ["KRW=X", "KRW"],
    ["-KRW", "KRW"],
    [".KS", "KRW"],
    [".KQ", "KRW"],
    ["-USD", "USD"],
    ["JPY", "JPY"],
    [".T", "JPY"],
    ["-HKD", "HKD"],
    [".HK", "HKD"],
    ["-EUR", "EUR"],
    ["-CNY", "CNY"],
    ["-GBP", "GBP"],
  ]
  for (const [suffix, cur] of tickerCurrency) {
    if (symbol.endsWith(suffix)) {
      currency = cur
      break
    }
  }
  return currency
}

/* https://financeapi.net/
   yH finance API(/v8/finance/spark) example response
{
  ETN: {
    timestamp: [
      1753968600,
      1754055000,
      1754314200,
      1754400600,
      1754487000,
      1754573400,
      1754659800
    ],
    symbol: 'ETN',
    end: null,
    dataGranularity: 300,
    close: [
      384.72, 381.29,
      384.76, 356.45,
      358.16, 360.16,
      362.84
    ],
    start: null,
    previousClose: null,
    chartPreviousClose: 390.09
  }
}
*/

/**
 * get stock data from the API. e.g. getStockData("ETN", "20211010")
 * @param symbol
 * @param date date가 null이면 가장 최근 데이터, date가 있으면 해당 날짜(YYYYMMDD 형식)의 데이터를 전달한다.
 * @param tz timezone of the symbol, e.g. "Asia/Seoul" or "America/New_York"
 * @returns value of the stock at the specific date. e.g. { value:100, currency:"USD" }
 */
export const requestYFApi = async (symbol: string, date: string, tz: string = "Asia/Seoul") => {
  const currency = getTickerCurrency(symbol)
  const symbols = [symbol]
  let nDays = 7 // number of days to fetch data
  let targetTimestamp = 0
  let targetDate = DateTime.now().setZone(tz)
  if (date?.length > 0) {
    targetDate = DateTime.fromFormat(date, "yyyyMMdd", { zone: tz })
    targetTimestamp = targetDate.toSeconds()
    nDays = Math.ceil((DateTime.now().toSeconds() - targetTimestamp) / (60 * 60 * 24))
    if (nDays > 365) {
      throw { code: `nDays[${nDays}] cannot exceed 365 days from today` }
    }
    console.log("request yf date:", date, "nDays:", nDays, "targetTimestamp:", targetTimestamp)
    nDays = Math.max(nDays, 7) // ensure at least 7 day
  } else {
    console.log("request yf date: latest")
  }

  const options = {
    method: "GET",
    url: `https://yfapi.net/v8/finance/spark?interval=1d&range=${nDays}d&symbols=${symbols.join(",")}`,
    params: { modules: "defaultKeyStatistics,assetProfile" },
    headers: {
      "x-api-key": process.env.YF_X_API_KEY,
    },
  }

  console.log("get stock-yf options:", options)
  const res = await axios.request(options)
  console.info("get stock-yf data:", res?.data)
  const data = res?.data
  if (!data || !data[symbols[0]]) {
    throw { code: `No data for symbol[${symbol}]` }
  }
  const rs: { [key: string]: number | null } = {}
  for (const symbol of symbols) {
    if (!data[symbol]) {
      rs[symbol] = null
      continue
    }
    const len = data[symbol].close.length
    if (targetTimestamp > 0 && len > 0) {
      const timestamps = data[symbol].timestamp
      if (timestamps[len - 1] < targetTimestamp) {
        // if the last timestamp is before the target date, return the last data
        rs[symbol] = data[symbol].close[len - 1]
        continue
      }
      for (let i = 0; i < timestamps.length; i++) {
        if (timestamps[i] >= targetTimestamp) {
          rs[symbol] = data[symbol].close[i]
          break
        }
      }
    } else {
      rs[symbol] = data[symbol].close[len - 1]
    }
  }
  return { catergory, symbol, date, ts: targetTimestamp, value: rs[symbol], currency }
}

const router = Router()

// GET stock price at the specific time
// GET /fapi/yf/ETN?date=20211010&tz=America/New_York
router.get(
  "/:id",
  async (
    req: Request<{ id: string }, never, never, { date: string; tz: string }>,
    res: Response
  ) => {
    const symbol = req.params.id
    const { date, tz } = req.query

    try {
      const data = await requestYFApi(symbol, date, tz)
      res.json({ success: true, data })
    } catch (error) {
      console.error("Error fetching data:", error)
      const ecode = error as { code: string }
      res.status(500).json({
        success: false,
        message: "Failed to fetch data",
        code: `${ecode.code}`,
        error: error,
      })
    }
  }
)

export default router
