import axios from "axios"
import { Request, Response, Router } from "express"

export const category = "stock"

/**
 * get stock data from the API. e.g. getStockData("ETN", "20211010")
 * @param symbol
 * @param date
 * @returns value of the stock at the specific date. e.g. {value:100,currency:"USD"}
 */
export const getStockData = async (symbol: string, date: string) => {
  const response = await axios.get(`https://cryptoprices.cc/${symbol}/`)
  // console.info("get crypto rs:", response)
  const data = response.data
  return { category, symbol, date, value: data, currency: "USD" }
}

const router = Router()

// GET stock price at the specific time
// GET /api/stock/ETN?at=20211010
router.get(
  "/:id",
  async (req: Request<{ id: string }, never, never, { date: string }>, res: Response) => {
    const symbol = req.params.id
    const { date } = req.query

    try {
      const data = await getStockData(symbol, date)
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

export default router
