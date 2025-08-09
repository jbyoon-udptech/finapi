import axios from "axios"
import { Request, Response, Router } from "express"

export const category = "crypto"

// https://developers.coindesk.com/documentation/data-api/spot_v1_historical_days
// @TODO coindesk API for historical crypto data 로 변경하기

export const requestCryptoData = async (symbol: string, date: string) => {
  //yyyy-MM-dd -> unix timestamp
  const toTs = new Date(`${date}T00:00+0900`).getTime() / 1000
  const response = await axios.get(
    `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${symbol}&tsym=USD&toTs=${toTs}`
  )
  if (response.data.Response === "Success") {
    const last = response.data.Data.Data.length - 1
    const data = response.data.Data.Data[last].close

    return { category, symbol, date, ts: toTs, value: data, currency: "USD" }
  } else {
    throw { code: response.data.Message }
  }
}

const router = Router()

// GET /api/cryto/BTC?date=2021-10-10
/**
 * @swagger
 * /api/crypto/{id}:
 *   get:
 *     summary: Get historical crypto data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The crypto asset ID
 *       - in: query
 *         name: date
 *         required: true
 *         description: The date to get historical data for (format: yyyy-MM-dd)
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: Crypto asset not found
 */
router.get(
  "/:id",
  async (req: Request<{ id: string }, never, never, { date: string }>, res: Response) => {
    const crytoId = req.params.id
    const { date } = req.query

    try {
      const data = await requestCryptoData(crytoId, date)
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
