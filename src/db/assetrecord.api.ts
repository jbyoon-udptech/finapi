// portfolio asset record APIs

import { Router, Request, Response } from "express"
import { PortfolioAssetRecordModel } from "./portfolio.model"

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
router.get("/", async (req: any, res: any) => {
  const portfolioId = req.params.portfolioId
  const data = await PortfolioAssetRecordModel.find({ _pfId: portfolioId }).exec()
  res.json(data)
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
router.get("/:id", async (req: any, res: any) => {
  const portfolioId = req.params.portfolioId
  const recordId = req.params.id
  const d = await PortfolioAssetRecordModel.findOne({ _id: recordId, _pfId: portfolioId }).exec()

  if (d) {
    res.json(d)
  } else {
    res.status(404).json({ message: "Portfolio asset record not found" })
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
 * Create a new portfolio asset record
 * @param {IPortfolioAssetRecord} data - Portfolio asset record data to create
 * @throws {Error} When required fields are missing
 * @returns {Promise} Created portfolio asset record
 */
const createPortfolio = async (data: IPortfolioAssetRecord) => {
  const { _pfId, _assetId, date, change, result, price, unit, memo } = data

  if (!_pfId || !_assetId || !date || !change || !unit) {
    throw new Error("Portfolio ID, Asset ID, date, change, and unit are required")
  }

  const d: IPortfolioAssetRecord = data
  return await PortfolioAssetRecordModel.create(d)
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
router.post("/", async (req: any, res: any) => {
  try {
    const portfolioId = req.params.portfolioId;
    const { _assetId, date, change, unit, result, price, memo } = req.body;

    if (!portfolioId || !_assetId || !date || change === undefined || unit === undefined) {
      return res.status(400).json({
        message: "Portfolio ID, Asset ID, date, change, and unit are required"
      });
    }

    const data: IPortfolioAssetRecord = {
      _pfId: portfolioId,
      _assetId,
      date,
      change,
      unit,
      result: result || 0,
      price: price || 0,
      memo: memo || ""
    };

    const rs = await createPortfolio(data);
    res.status(201).json({
      message: "Portfolio asset record created successfully",
      data: rs
    });
  } catch (error) {
    console.error("Error creating portfolio asset record:", error);
    res.status(500).json({ message: "Error creating portfolio asset record" });
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
router.put("/:id", async (req: any, res: any) => {
  try {
    const portfolioId = req.params.portfolioId;
    const { _assetId, date, change, unit, result, price, memo } = req.body;

    if (!portfolioId || !_assetId || !date || change === undefined || unit === undefined) {
      return res.status(400).json({
        message: "Portfolio ID, Asset ID, date, change, and unit are required"
      });
    }

    const data: IPortfolioAssetRecord = {
      _pfId: portfolioId,
      _assetId,
      date,
      change,
      unit,
      result: result || 0,
      price: price || 0,
      memo: memo || ""
    };

    const rs = await PortfolioAssetRecordModel.updateOne(
      { _id: req.params.id, _pfId: portfolioId },
      data
    ).exec();

    if (rs.matchedCount === 0) {
      return res.status(404).json({ message: "Portfolio asset record not found" });
    }

    res.status(200).json({
      message: "Portfolio asset record updated successfully",
      data: rs
    });
  } catch (error) {
    console.error("Error updating portfolio asset record:", error);
    res.status(500).json({ message: "Error updating portfolio asset record" });
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
router.delete("/:id", async (req: any, res: any) => {
  try {
    const portfolioId = req.params.portfolioId;
    const recordId = req.params.id;

    const rs = await PortfolioAssetRecordModel.findOneAndDelete({
      _id: recordId,
      _pfId: portfolioId
    }).exec();

    if (rs) {
      res.status(200).json({ message: "Portfolio asset record deleted successfully" });
    } else {
      res.status(404).json({ message: "Portfolio asset record not found" });
    }
  } catch (error) {
    console.error("Error deleting portfolio asset record:", error);
    res.status(500).json({ message: "Error deleting portfolio asset record" });
  }
})
export default router
