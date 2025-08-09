import axios from "axios"
import { Request, Response, Router } from "express"

export const category = "currency"

/* www.koreaexim.go.kr sample response
  curl `https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?searchdate=20250710&data=AP01`
  [
    {
      "result": 1,
      "cur_unit": "USD",
      "ttb": "1,365.5",
      "tts": "1,393.09",
      "deal_bas_r": "1,379.3",
      "bkpr": "1,379",
      "yy_efee_r": "0",
      "ten_dd_efee_r": "0",
      "kftc_bkpr": "1,379",
      "kftc_deal_bas_r": "1,379.3",
      "cur_nm": "미국 달러"
    }
  ...
  ]
*/

export const requestCurrencyData = async (symbol: string, date: string) => {
  const toTs = new Date(`${date}T00:00+0900`).getTime() / 1000
  const rs = await axios.get(
    `https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=kafcch9C4fr3kjWiRMGlWzDOblqWqtln&searchdate=${date}&data=AP01`
  )
  if (rs.data.Response === "Success") {
    const target = rs.data.find((e: { cur_unit: string }) => e.cur_unit === symbol)
    const value = target?.deal_bas_r ? target.deal_bas_r : 0

    return { category, symbol, date, ts: toTs, value, currency: "KRW" }
  } else {
    throw { code: rs.data.Message }
  }
}

const router = Router()

// Currency price at a specific time
// GET /api/currency/USD?date=20211010
router.get(
  "/:id",
  async (req: Request<{ id: string }, never, never, { date: string }>, res: Response) => {
    const { id } = req.params
    const { date } = req.query

    try {
      const data = await requestCurrencyData(id, date)
      res.json({ success: true, ...data })
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
