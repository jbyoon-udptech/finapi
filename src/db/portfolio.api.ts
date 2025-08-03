// portfolio APIs

import { Router, Request, Response } from "express"
import { PortfolioList, PortfolioListModel } from "./portfolio.model"

const router = Router()

/**
 * @swagger
 * /api/portfolio:
 *   get:
 *     summary: Get all portfolios
 *     description: Retrieve a list of all portfolios
 *     tags: [Portfolio]
 *     responses:
 *       200:
 *         description: Successfully retrieved all portfolios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Portfolio'
 *       500:
 *         description: Internal server error
 */
router.get("/", async (req: Request, res: Response) => {
  const portfolios = await PortfolioListModel.find()
  res.json(portfolios)
})

/**
 * @swagger
 * /api/portfolio/{id}:
 *   get:
 *     summary: Get portfolio by ID
 *     description: Retrieve a specific portfolio by its ID
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Portfolio ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the portfolio
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Portfolio'
 *       404:
 *         description: Portfolio not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Portfolio not found"
 *       500:
 *         description: Internal server error
 */
router.get("/:id", async (req: Request<{ id: string }>, res: Response) => {
  const portfolio = await PortfolioListModel.findById(req.params.id).exec()

  if (portfolio) {
    res.json(portfolio)
  } else {
    res.status(404).json({ message: "Portfolio not found" })
  }
})

/**
 * @swagger
 * components:
 *   schemas:
 *     Portfolio:
 *       type: object
 *       required:
 *         - name
 *         - currency
 *         - timezone
 *       properties:
 *         _id:
 *           type: string
 *           description: Portfolio unique identifier
 *         name:
 *           type: string
 *           description: Portfolio name
 *           example: "JB's Portfolio"
 *         currency:
 *           type: string
 *           description: Portfolio currency
 *           default: "KRW"
 *           example: "KRW"
 *         timezone:
 *           type: string
 *           description: Portfolio timezone
 *           default: "Asia/Seoul"
 *           example: "Asia/Seoul"
 *     PortfolioInput:
 *       type: object
 *       required:
 *         - name
 *         - currency
 *         - timezone
 *       properties:
 *         name:
 *           type: string
 *           description: Portfolio name
 *           example: "JB's Portfolio"
 *         currency:
 *           type: string
 *           description: Portfolio currency
 *           example: "KRW"
 *         timezone:
 *           type: string
 *           description: Portfolio timezone
 *           example: "Asia/Seoul"
 */
interface IPortfolio {
  name: string
  currency: string
  timezone: string
}

/**
 * Update or create a portfolio
 * @param {IPortfolio} data - Portfolio data to update or create
 * @throws {Error} When required fields are missing
 */
const updatePortfolio = async (data: IPortfolio) => {
  const { name, currency, timezone } = data

  if (!name || !currency || !timezone) {
    throw new Error("Name, currency, and timezone are required")
  }

  const newPortfolio: IPortfolio = data
  await PortfolioListModel.updateOne({ name }, newPortfolio, { upsert: true }).exec()
}

/**
 * @swagger
 * /api/portfolio:
 *   post:
 *     summary: Create a new portfolio
 *     description: Create a new portfolio with the provided information
 *     tags: [Portfolio]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PortfolioInput'
 *     responses:
 *       201:
 *         description: Portfolio created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Portfolio created successfully"
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Name, currency, and timezone are required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating portfolio"
 */
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

/**
 * @swagger
 * /api/portfolio/{id}:
 *   put:
 *     summary: Update portfolio by ID
 *     description: Update an existing portfolio with the provided information
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Portfolio ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PortfolioInput'
 *     responses:
 *       200:
 *         description: Portfolio updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Portfolio updated successfully"
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Name, currency, and timezone are required"
 *       404:
 *         description: Portfolio not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error updating portfolio"
 */
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

/**
 * @swagger
 * /api/portfolio/{id}:
 *   delete:
 *     summary: Delete portfolio by ID
 *     description: Delete a specific portfolio by its ID
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Portfolio ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Portfolio deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Portfolio deleted successfully"
 *       404:
 *         description: Portfolio not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error deleting portfolio"
 */
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
