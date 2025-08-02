// asset APIs

import { Router, Request, Response } from "express"
import { PortfolioAssetRecordModel } from "./portfolio.model"

const router = Router()

// GET /pfassetrecord - read all portfolio asset records
router.get("/", async (req: Request, res: Response) => {
  const all = await PortfolioAssetRecordModel.find()
  res.json(all)
})

// GET /pfassetrecord/:id - get asset record
router.get("/:id", async (req: Request<{ id: string }>, res: Response) => {
  const d = await PortfolioAssetRecordModel.findById(req.params.id).exec()

  if (d) {
    res.json(d)
  } else {
    res.status(404).json({ message: "Portfolio not found" })
  }
})

interface IPortfolioAssetRecord {
  _pfId: string
  _assetId: string
  date: string
  change: number
  result: number
  price: number
  unit: string
  memo: string
}

const createPortfolio = async (data: IPortfolioAssetRecord) => {
  const { _pfId, _assetId, date, change, result, price, unit, memo } = data

  if (!_pfId || !_assetId || !date || !change || !unit) {
    throw new Error("Portfolio ID, Asset ID, date, change, and unit are required")
  }

  const d: IPortfolioAssetRecord = data
  return await PortfolioAssetRecordModel.create(d)
}

router.post("/", async (req: Request, res: Response) => {
  try {
    const data: IPortfolioAssetRecord = req.body
    const rs = await createPortfolio(data)
    res.status(201).json({ message: "Portfolio created successfully", data: rs })
  } catch (error) {
    console.error("Error creating portfolio:", error)
    res.status(500).json({ message: "Error creating portfolio" })
  }
})

router.put("/:id", async (req: Request<{ id: string }>, res: Response) => {
  try {
    const data: IPortfolioAssetRecord = req.body
    let rs
    if (req.body._id && req.body._id === req.params.id) {
      rs = await PortfolioAssetRecordModel.updateOne({ _id: req.body._id }, data).exec()
    } else {
      rs = await createPortfolio(data)
    }
    res.status(200).json({ message: "Portfolio updated successfully", data: rs })
  } catch (error) {
    console.error("Error updating portfolio:", error)
    res.status(500).json({ message: "Error updating portfolio" })
  }
})

router.delete("/:id", async (req: Request<{ id: string }>, res: Response) => {
  try {
    const portfolioId = req.params.id
    const rs = await PortfolioAssetRecordModel.findByIdAndDelete(portfolioId).exec()
    if (rs) {
      res.status(200).json({ message: "Portfolio asset record deleted successfully" })
    } else {
      res.status(404).json({ message: "Portfolio asset record not found" })
    }
  } catch (error) {
    console.error("Error deleting portfolio:", error)
    res.status(500).json({ message: "Error deleting portfolio" })
  }
})
export default router
