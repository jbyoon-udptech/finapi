import { Router, Request, Response } from "express"
import axios from "axios"

const router = Router()

// GET Crypto price at a specific time
router.get(
  "/:id",
  async (
    req: Request<{ id: string }, {}, {}, { at: string }>,
    res: Response
  ) => {
    const crytoId = req.params.id
    const { at } = req.query

    try {
      const response = await axios.get(`https://cryptoprices.cc/${crytoId}/`)
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

export default router
