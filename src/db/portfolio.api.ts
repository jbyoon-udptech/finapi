// portfolio APIs

import { Request, Response, Router } from "express"
import mongoose from "mongoose"
import { PortfolioListModel } from "./portfolio.model"

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
 *     summary: Get a specific portfolio by ID
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Portfolio unique identifier
 *     responses:
 *       200:
 *         description: Portfolio found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Portfolio'
 *       400:
 *         description: Invalid portfolio ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid portfolio ID"
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
// @ts-expect-error id is a path parameter
router.get("/:id", async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid portfolio ID" })
    }

    const portfolio = await PortfolioListModel.findById(req.params.id).exec()

    if (portfolio) {
      res.json(portfolio)
    } else {
      res.status(404).json({ message: "Portfolio not found" })
    }
  } catch (error) {
    console.error("Error fetching portfolio:", error)
    res.status(500).json({ message: "Error fetching portfolio" })
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

// @ts-expect-error id is a path parameter
router.post("/", async (req, res) => {
  try {
    const { name, currency, timezone } = req.body

    // Validate required fields
    if (!name || !currency || !timezone) {
      return res.status(400).json({ message: "Name, currency, and timezone are required" })
    }

    // Check if portfolio name already exists
    const existingPortfolio = await PortfolioListModel.findOne({ name }).exec()
    if (existingPortfolio) {
      return res.status(400).json({ message: "Portfolio name already exists" })
    }

    // Create new portfolio
    const newPortfolio = new PortfolioListModel({
      name,
      currency,
      timezone,
    })

    const savedPortfolio = await newPortfolio.save()

    res.status(201).json({
      message: "Portfolio created successfully",
      data: savedPortfolio,
    })
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
// @ts-expect-error id is a path parameter
router.put("/:id", async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid portfolio ID" })
    }

    const { name, currency, timezone } = req.body

    // Validate required fields
    if (!name || !currency || !timezone) {
      return res.status(400).json({ message: "Name, currency, and timezone are required" })
    }

    // Check if portfolio exists
    const existingPortfolio = await PortfolioListModel.findById(req.params.id).exec()
    if (!existingPortfolio) {
      return res.status(404).json({ message: "Portfolio not found" })
    }

    // Update portfolio
    const updatedPortfolio = await PortfolioListModel.findByIdAndUpdate(
      req.params.id,
      { name, currency, timezone },
      { new: true }
    ).exec()

    res.status(200).json({ message: "Portfolio updated successfully", data: updatedPortfolio })
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
// @ts-expect-error id is a path parameter
router.delete("/:id", async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid portfolio ID" })
    }

    const portfolioId = req.params.id

    // Check if portfolio exists before deleting
    const existingPortfolio = await PortfolioListModel.findById(portfolioId).exec()
    if (!existingPortfolio) {
      return res.status(404).json({ message: "Portfolio not found" })
    }

    await PortfolioListModel.findByIdAndDelete(portfolioId).exec()
    res.status(200).json({ message: "Portfolio deleted successfully" })
  } catch (error) {
    console.error("Error deleting portfolio:", error)
    res.status(500).json({ message: "Error deleting portfolio" })
  }
})
export default router
