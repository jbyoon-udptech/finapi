import { Router, Request, Response } from "express"
import axios from "axios"

const router = Router()

// GET stock price at the specific time
// GET /api/stock/ETN?at=20211010
router.get(
  "/:id",
  async (
    req: Request<{ id: string }, {}, {}, { at: string }>,
    res: Response
  ) => {
    const stockId = req.params.id
    const { at } = req.query

    try {
      const response = await axios.get(`https://cryptoprices.cc/${stockId}/`)
      // console.info("get crypto rs:", response)
      const data = response.data
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

router.get("/xx/:asset/:date", async (req: Request, res: Response) => {
  const { date, asset } = req.params

  try {
    // 예시: 외부 API에서 주식 데이터를 가져오는 비동기 작업
    const response = await axios.get(
      `https://api.example.com/stocks/${asset}/${date}`
    )
    const data = response.data

    res.json({ date, asset, value: data })
  } catch (error) {
    console.error("Error fetching stocks data:", error)
    res.status(500).json({ message: "Failed to fetch stocks data" })
  }
})

export default router
