import { Router, Request, Response } from "express"
import { DateTime } from "luxon"
import crypto from "./crypto"
import currency from "./currency"
import user from "./user"
import { updatePortfolioAll } from "../scheduler"

const router = Router()

router.use("/crypto", crypto)
router.use("/currency", currency)
router.use("/stock", crypto)

router.get("/scheduler", async (req: Request, res: Response) => {
  const date = req.query.date as string
  const { name, assets } = req.body
  try {
    const nDate = date
      ? DateTime.fromFormat(date, "yyyy-MM-dd")
      : DateTime.now()
    await updatePortfolioAll(nDate)
    res.status(201).send("scheduler updated")
  } catch (error) {
    res.status(500).send("Error in executing scheduler")
  }
})

router.use("/users", user)
router.get("/hello", (request: Request, response: Response) => {
  response.status(200).send(`Hello World: ${new Date().toISOString()}`)
})

export default router
