import { Router, Request, Response } from "express"
import axios from "axios"
import { DateTime } from "luxon"

const router = Router()

// Currency price at a specific time
// GET /api/currency/USD?at=20211010
router.get("/:id", async (req: Request<{ id: string }, {}, {}, { at: string }>, res: Response) => {
  const cID = req.params.id
  const { at } = req.query
  const dt8 = at ? at : DateTime.now().toFormat("yyyyMMdd")

  /*
    var url = `https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=kafcch9C4fr3kjWiRMGlWzDOblqWqtln&searchdate=${toYYYYMMDD(date)}&data=AP01`
    [...
    {"result":1,"cur_unit":"USD","ttb":"1,365.5","tts":"1,393.09","deal_bas_r":"1,379.3","bkpr":"1,379","yy_efee_r":"0","ten_dd_efee_r":"0","kftc_bkpr":"1,379","kftc_deal_bas_r":"1,379.3","cur_nm":"미국 달러"}
    ]
    */

  try {
    const rs = await axios.get(
      `https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=kafcch9C4fr3kjWiRMGlWzDOblqWqtln&searchdate=${dt8}&data=AP01`
    )
    const target = rs.data.find((e: any) => e.cur_unit === cID)
    const value = target?.deal_bas_r ? target.deal_bas_r : 0
    res.json({ success: true, data: value })
  } catch (error) {
    console.error("Error fetching posts:", error)
    const ecode = error as { code: string }
    res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
      code: `${ecode.code}`,
    })
  }
})

export default router
