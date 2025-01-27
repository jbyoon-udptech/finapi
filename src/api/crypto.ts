import { Router, Request, Response } from "express"
import axios from "axios"

const router = Router()

export const getCryptoData = async (ticker: string, date: string) => {
  //yyyy-MM-dd -> unix timestamp
  const toTs = new Date(`${date}T00:00+0900`).getTime()/1000
  const response = await axios.get(`https://min-api.cryptocompare.com/data/v2/histoday?fsym=${ticker}&tsym=USD&toTs=${toTs}`)
  if (response.data.Response === "Success") {
    const last = response.data.Data.Data.length - 1
    const data = response.data.Data.Data[last].close
    return {value: data, "currency": "USD"}
  } else {
    throw { code: response.data.Message }
  }
}

// GET Crypto price at a specific time
// GET /api/cryto/BTC?date=20211010
router.get(
  "/:id",
  async (
    req: Request<{ id: string }, {}, {}, { date: string }>,
    res: Response
  ) => {
    const crytoId = req.params.id
    const { date } = req.query

    try {
      const data = await getCryptoData(crytoId, date)
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