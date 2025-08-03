// portfolio asset record APIs

import { Router } from "express"
import mongoose from "mongoose"
import { PortfolioAssetRecordModel, PortfolioListModel } from "./portfolio.model"

const router = Router({ mergeParams: true })

/**
 * @swagger
 * /api/portfolio/{portfolioId}/assetrecord:
 *   get:
 *     summary: Get all asset records for a portfolio
 *     description: Retrieve a list of all asset records for a specific portfolio
 *     tags: [Portfolio Asset Record]
 *     parameters:
 *       - in: path
 *         name: portfolioId
 *         required: true
 *         description: Portfolio ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved all portfolio asset records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PortfolioAssetRecord'
 *       500:
 *         description: Internal server error
 */
// @ts-ignore
router.get("/:portfolioId/assetrecord", async (req, res) => {
  try {
    // Validate portfolio ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.portfolioId)) {
      return res.status(400).json({ message: "Invalid portfolio ID" })
    }

    const portfolioId = req.params.portfolioId

    // Check if portfolio exists
    const portfolio = await PortfolioListModel.findById(portfolioId).exec()
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" })
    }

    const data = await PortfolioAssetRecordModel.find({ _pfId: portfolioId })
      .sort({ date: 1 })
      .exec()
    res.json(data)
  } catch (error) {
    console.error("Error fetching asset records:", error)
    res.status(500).json({ message: "Error fetching asset records" })
  }
})

/**
 * @swagger
 * /api/portfolio/{portfolioId}/assetrecord/{id}:
 *   get:
 *     summary: Get portfolio asset record by ID
 *     description: Retrieve a specific portfolio asset record by its ID within a portfolio
 *     tags: [Portfolio Asset Record]
 *     parameters:
 *       - in: path
 *         name: portfolioId
 *         required: true
 *         description: Portfolio ID
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         description: Portfolio asset record ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the portfolio asset record
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PortfolioAssetRecord'
 *       404:
 *         description: Portfolio asset record not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Portfolio asset record not found"
 *       500:
 *         description: Internal server error
 */
// @ts-ignore
router.get("/:portfolioId/assetrecord/:id", async (req, res) => {
  try {
    // Validate ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(req.params.portfolioId)) {
      return res.status(400).json({ message: "Invalid portfolio ID" })
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid asset record ID" })
    }

    const portfolioId = req.params.portfolioId
    const recordId = req.params.id

    const d = await PortfolioAssetRecordModel.findOne({ _id: recordId, _pfId: portfolioId }).exec()

    if (d) {
      res.json(d)
    } else {
      // Check if record exists but belongs to different portfolio
      const recordExists = await PortfolioAssetRecordModel.findById(recordId).exec()
      if (recordExists) {
        res.status(404).json({ message: "Asset record not found in this portfolio" })
      } else {
        res.status(404).json({ message: "Asset record not found" })
      }
    }
  } catch (error) {
    console.error("Error fetching asset record:", error)
    res.status(500).json({ message: "Error fetching asset record" })
  }
})

/**
 * @swagger
 * components:
 *   schemas:
 *     PortfolioAssetRecord:
 *       type: object
 *       required:
 *         - _pfId
 *         - _assetId
 *         - date
 *         - change
 *         - unit
 *       properties:
 *         _id:
 *           type: string
 *           description: Portfolio asset record unique identifier
 *         _pfId:
 *           type: string
 *           description: Portfolio ID reference
 *           example: "64f7a1b2c3d4e5f6a7b8c9d0"
 *         _assetId:
 *           type: string
 *           description: Asset ID reference
 *           example: "64f7a1b2c3d4e5f6a7b8c9d1"
 *         date:
 *           type: string
 *           format: date
 *           description: Transaction date
 *           example: "2025-01-01"
 *         change:
 *           type: number
 *           description: Change amount of the asset
 *           example: 3.1
 *         result:
 *           type: number
 *           description: Total number of the asset after change
 *           default: 0
 *           example: 7.1
 *         price:
 *           type: number
 *           description: Asset price at the transaction date
 *           default: 0
 *           example: 2300
 *         unit:
 *           type: string
 *           description: Price unit currency
 *           default: ""
 *           example: "USD"
 *         memo:
 *           type: string
 *           description: Transaction memo
 *           default: ""
 *           example: "Bought 3.1 ETH at 2300 USD"
 *     PortfolioAssetRecordInput:
 *       type: object
 *       required:
 *         - _assetId
 *         - date
 *         - change
 *         - unit
 *       properties:
 *         _assetId:
 *           type: string
 *           description: Asset ID reference
 *           example: "64f7a1b2c3d4e5f6a7b8c9d1"
 *         date:
 *           type: string
 *           format: date
 *           description: Transaction date
 *           example: "2025-01-01"
 *         change:
 *           type: number
 *           description: Change amount of the asset
 *           example: 3.1
 *         result:
 *           type: number
 *           description: Total number of the asset after change
 *           example: 7.1
 *         price:
 *           type: number
 *           description: Asset price at the transaction date
 *           example: 2300
 *         unit:
 *           type: string
 *           description: Price unit currency
 *           example: "USD"
 *         memo:
 *           type: string
 *           description: Transaction memo
 *           example: "Bought 3.1 ETH at 2300 USD"
 */
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

/**
 * @swagger
 * /api/portfolio/{portfolioId}/assetrecord:
 *   post:
 *     summary: Create a new portfolio asset record
 *     description: Create a new portfolio asset record for a specific portfolio
 *     tags: [Portfolio Asset Record]
 *     parameters:
 *       - in: path
 *         name: portfolioId
 *         required: true
 *         description: Portfolio ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PortfolioAssetRecordInput'
 *     responses:
 *       201:
 *         description: Portfolio asset record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Portfolio asset record created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/PortfolioAssetRecord'
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Portfolio ID, Asset ID, date, change, and unit are required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating portfolio asset record"
 */
// @ts-ignore
router.post("/:portfolioId/assetrecord", async (req, res) => {
  try {
    // Validate portfolio ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.portfolioId)) {
      return res.status(400).json({ message: "Invalid portfolio ID" })
    }

    const portfolioId = req.params.portfolioId

    // Check if portfolio exists
    const portfolio = await PortfolioListModel.findById(portfolioId).exec()
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" })
    }

    const { _assetId, date, change, unit, result, price, memo } = req.body

    // Validate required fields
    if (!_assetId || !date || change === undefined || !unit) {
      return res.status(400).json({
        message: "All required fields must be provided",
      })
    }

    // Validate date format (simple check)
    if (isNaN(Date.parse(date))) {
      return res.status(400).json({ message: "Invalid date format" })
    }

    const data = {
      _pfId: portfolioId,
      _assetId,
      date,
      change,
      unit,
      result: result !== undefined ? result : 0,
      price: price !== undefined ? price : 0,
      memo: memo || "",
    }

    const newRecord = new PortfolioAssetRecordModel(data)
    const savedRecord = await newRecord.save()

    res.status(201).json({
      message: "Asset record created successfully",
      data: savedRecord,
    })
  } catch (error) {
    console.error("Error creating asset record:", error)
    res.status(500).json({ message: "Error creating asset record" })
  }
})

/**
 * @swagger
 * /api/portfolio/{portfolioId}/assetrecord/{id}:
 *   put:
 *     summary: Update portfolio asset record by ID
 *     description: Update an existing portfolio asset record within a specific portfolio
 *     tags: [Portfolio Asset Record]
 *     parameters:
 *       - in: path
 *         name: portfolioId
 *         required: true
 *         description: Portfolio ID
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         description: Portfolio asset record ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PortfolioAssetRecordInput'
 *     responses:
 *       200:
 *         description: Portfolio asset record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Portfolio asset record updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/PortfolioAssetRecord'
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Portfolio ID, Asset ID, date, change, and unit are required"
 *       404:
 *         description: Portfolio asset record not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Portfolio asset record not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
// @ts-ignore
router.put("/:portfolioId/assetrecord/:id", async (req, res) => {
  try {
    // Validate ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(req.params.portfolioId)) {
      return res.status(400).json({ message: "Invalid portfolio ID" })
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid asset record ID" })
    }

    const portfolioId = req.params.portfolioId
    const recordId = req.params.id
    const { change, result, price, unit, memo } = req.body

    // Validate required fields
    if (change === undefined || result === undefined || price === undefined || !unit) {
      return res.status(400).json({
        message: "All required fields must be provided",
      })
    }

    // Check if record exists and belongs to portfolio
    const existingRecord = await PortfolioAssetRecordModel.findOne({
      _id: recordId,
      _pfId: portfolioId,
    }).exec()

    if (!existingRecord) {
      // Check if record exists but belongs to different portfolio
      const recordExists = await PortfolioAssetRecordModel.findById(recordId).exec()
      if (recordExists) {
        return res.status(404).json({ message: "Asset record not found in this portfolio" })
      } else {
        return res.status(404).json({ message: "Asset record not found" })
      }
    }

    // Update record
    const updatedRecord = await PortfolioAssetRecordModel.findByIdAndUpdate(
      recordId,
      { change, result, price, unit, memo },
      { new: true }
    ).exec()

    res.status(200).json({ message: "Asset record updated successfully", data: updatedRecord })
  } catch (error) {
    console.error("Error updating asset record:", error)
    res.status(500).json({ message: "Error updating asset record" })
  }
})

/**
 * @swagger
 * /api/portfolio/{portfolioId}/assetrecord/{id}:
 *   delete:
 *     summary: Delete portfolio asset record by ID
 *     description: Delete a specific portfolio asset record by its ID within a portfolio
 *     tags: [Portfolio Asset Record]
 *     parameters:
 *       - in: path
 *         name: portfolioId
 *         required: true
 *         description: Portfolio ID
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         description: Portfolio asset record ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Portfolio asset record deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Portfolio asset record deleted successfully"
 *       404:
 *         description: Portfolio asset record not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Portfolio asset record not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error deleting portfolio asset record"
 */
// @ts-ignore
router.delete("/:portfolioId/assetrecord/:id", async (req, res) => {
  try {
    // Validate ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(req.params.portfolioId)) {
      return res.status(400).json({ message: "Invalid portfolio ID" })
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid asset record ID" })
    }

    const portfolioId = req.params.portfolioId
    const recordId = req.params.id

    // Check if record exists and belongs to portfolio
    const existingRecord = await PortfolioAssetRecordModel.findOne({
      _id: recordId,
      _pfId: portfolioId,
    }).exec()

    if (!existingRecord) {
      // Check if record exists but belongs to different portfolio
      const recordExists = await PortfolioAssetRecordModel.findById(recordId).exec()
      if (recordExists) {
        return res.status(404).json({ message: "Asset record not found in this portfolio" })
      } else {
        return res.status(404).json({ message: "Asset record not found" })
      }
    }

    // Delete record
    await PortfolioAssetRecordModel.findByIdAndDelete(recordId).exec()

    res.status(200).json({ message: "Asset record deleted successfully" })
  } catch (error) {
    console.error("Error deleting asset record:", error)
    res.status(500).json({ message: "Error deleting asset record" })
  }
})

export default router
