import { Request, Response, Router } from "express"
import { DateTime } from "luxon"

import crypto from "./api/crypto"
import currency from "./api/currency"
import stock from "./api/stock"
import user from "./api/user"
import yf from "./api/yf"

import asset from "./db/asset.api"
import assetrecord from "./db/assetrecord.api"
import portfolio from "./db/portfolio.api"

import fs from "fs"
import { updatePortfolioAll } from "./db/portfolio.ctrl"

const router = Router()

router.get("/health", (_req: Request, res: Response) => {
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

// financial APIs
router.use("/fapi/crypto", crypto)
router.use("/fapi/currency", currency)
router.use("/fapi/stock", stock)
router.use("/fapi/yf", yf)

// app APIs
router.use("/asset", asset)
router.use("/portfolio", portfolio)

// Nested route for portfolio asset records
router.use("/portfolio/:portfolioId/assetrecord", assetrecord)

router.get("/updatePortfolio", async (req: Request, res: Response) => {
  const date = req.query.date as string
  //const { name, assets } = req.body
  try {
    const nDate = date ? DateTime.fromFormat(date, "yyyy-MM-dd") : DateTime.now()
    await updatePortfolioAll(nDate)
    res.status(201).send("portfolio updated")
  } catch (error) {
    res.status(500).send("Error in executing portfolio update")
  }
})

router.use("/users", user)

export default router
