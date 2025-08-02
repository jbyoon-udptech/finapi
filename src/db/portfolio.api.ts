// asset APIs

import { Router, Request, Response } from "express"
import { PortfolioList, PortfolioListModel } from "./portfolio.model"

const router = Router()

// GET /portfolio - read all portfolios
router.get("/", async (req: Request, res: Response) => {
  const portfolios = await PortfolioListModel.find()
  res.json(portfolios)
})

// GET /portfolio/:id - 특정 포트폴리오 가져오기
router.get("/:id", async (req: Request<{ id: string }>, res: Response) => {
  const portfolio = await PortfolioListModel.findById(req.params.id).exec()

  if (portfolio) {
    res.json(portfolio)
  } else {
    res.status(404).json({ message: "Portfolio not found" })
  }
})

interface IPortfolio {
  name: string
  currency: string
  timezone: string
}

const updatePortfolio = async (data: IPortfolio) => {
  const { name, currency, timezone } = data

  if (!name || !currency || !timezone) {
    throw new Error("Name, currency, and timezone are required")
  }

  const newPortfolio: IPortfolio = data
  await PortfolioListModel.updateOne({ name }, newPortfolio, { upsert: true }).exec()
}

router.post("/", async (req: Request, res: Response) => {
  try {
    const data: IPortfolio = req.body
    await updatePortfolio(data)
    res.status(201).json({ message: "Portfolio created successfully" })
  } catch (error) {
    console.error("Error creating portfolio:", error)
    res.status(500).json({ message: "Error creating portfolio" })
  }
})

router.put("/:id", async (req: Request<{ id: string }>, res: Response) => {
  try {
    const data: IPortfolio = req.body
    await updatePortfolio(data)
    res.status(200).json({ message: "Portfolio updated successfully" })
  } catch (error) {
    console.error("Error updating portfolio:", error)
    res.status(500).json({ message: "Error updating portfolio" })
  }
})

router.delete("/:id", async (req: Request<{ id: string }>, res: Response) => {
  try {
    const portfolioId = req.params.id
    await PortfolioListModel.findByIdAndDelete(portfolioId).exec()
    res.status(200).json({ message: "Portfolio deleted successfully" })
  } catch (error) {
    console.error("Error deleting portfolio:", error)
    res.status(500).json({ message: "Error deleting portfolio" })
  }
})
export default router
