import { Router, Request, Response } from "express"
import { DateTime } from "luxon"
import crypto from "./crypto"
import currency from "./currency"
import user from "./user"

import asset from "../db/asset.api"
import portfolio from "../db/portfolio.api"
import pfassetrecord from "../db/pfassetrecord.api"

import { updatePortfolioAll } from "../db/portfolio.ctrl"
import fs from "fs"

const router = Router()

router.get("/health", (req: Request, res: Response) => {
  res.status(200).send(`OK ${new Date().toISOString()}`)
})

router.get("/version", (req: Request, res: Response) => {
  const pkg = fs.readFileSync("./package.json", "utf-8")
  if (!pkg) {
    res.status(500).send("Package file not found")
    return
  }
  const packageJson = JSON.parse(pkg)

  res.setHeader("Content-Type", "application/json")
  res.status(200).send({
    version: packageJson.version,
    date: new Date().toISOString(),
  })
})

// finantial APIs
router.use("/crypto", crypto)
router.use("/currency", currency)
router.use("/stock", crypto)

// fin APIs
router.use("/asset", asset)
router.use("/portfolio", portfolio)
router.use("/pfassetrecord", pfassetrecord)

router.get("/updatePortfolio", async (req: Request, res: Response) => {
  const date = req.query.date as string
  const { name, assets } = req.body
  try {
    const nDate = date
      ? DateTime.fromFormat(date, "yyyy-MM-dd")
      : DateTime.now()
    await updatePortfolioAll(nDate)
    res.status(201).send("portfolio updated")
  } catch (error) {
    res.status(500).send("Error in executing portfolio update")
  }
})

router.use("/users", user)
router.get("/hello", (request: Request, response: Response) => {
  response.status(200).send(`Hello World: ${new Date().toISOString()}`)
})

export default router
