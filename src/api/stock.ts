import { Router, Request, Response } from "express"
import axios from "axios"

const router = Router()
/**
 * get stock data from the API. e.g. getStockData("ETN", "20211010")
 * @param ticker
 * @param date
 * @returns value of the stock at the specific date. e.g. {value:100,currency:"USD"}
 */
export const getStockData = async (ticker: string, date: string) => {
  const response = await axios.get(`https://cryptoprices.cc/${ticker}/`)
  // console.info("get crypto rs:", response)
  const data = response.data
  return { value: data, currency: "USD" }
}

// GET stock price at the specific time
// GET /api/stock/ETN?at=20211010
router.get(
  "/:id",
  async (
    req: Request<{ id: string }, {}, {}, { date: string }>,
    res: Response
  ) => {
    const ticker = req.params.id
    const { date } = req.query

    try {
      const data = await getStockData(ticker, date)
      res.json({ success: true, data })
    } catch (error) {
      console.error("Error fetching posts:", error)
      const ecode = error as { code: string }
      res.status(500).json({
        success: false,
        message: "Failed to fetch posts",
        code: `${ecode.code}`,
      })
    }
  }
)

exports.getData = getStockData

export default router
