// asset APIs

import { Router, Request, Response } from "express"
import mongoose from "mongoose"
import { AssetList, AssetListModel } from "./asset.model"

const router = Router()

/**
 * @swagger
 * /api/asset:
 *   get:
 *     summary: Get all assets
 *     description: Retrieve a list of all assets
 *     tags: [Asset]
 *     responses:
 *       200:
 *         description: Successfully retrieved all assets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Asset'
 *       500:
 *         description: Internal server error
 */
router.get("/", async (req: Request, res: Response) => {
  const assets = await AssetListModel.find()
  res.json(assets)
})

/**
 * @swagger
 * /api/asset/{id}:
 *   get:
 *     summary: Get asset by ID
 *     description: Retrieve a specific asset by its ID
 *     tags: [Asset]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Asset ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the asset
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Asset'
 *       404:
 *         description: Asset not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Asset not found"
 *       500:
 *         description: Internal server error
 */
// @ts-ignore
router.get("/:id", async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid asset ID" })
    }

    const asset = await AssetListModel.findById(req.params.id).exec()

    if (asset) {
      res.json(asset)
    } else {
      res.status(404).json({ message: "Asset not found" })
    }
  } catch (error) {
    console.error("Error fetching asset:", error)
    res.status(500).json({ message: "Error fetching asset" })
  }
})

/**
 * @swagger
 * components:
 *   schemas:
 *     Asset:
 *       type: object
 *       required:
 *         - category
 *         - name
 *         - ticker
 *       properties:
 *         _id:
 *           type: string
 *           description: Asset unique identifier
 *         category:
 *           type: string
 *           description: Asset category
 *           enum: [currency, crypto, KOSPI, KOSDAQ, NASDAQ, NYSE]
 *           example: "crypto"
 *         name:
 *           type: string
 *           description: Asset name
 *           example: "ETH"
 *         ticker:
 *           type: string
 *           description: Asset ticker symbol
 *           example: "ETH"
 *         unit:
 *           type: number
 *           description: Asset unit value
 *           example: 1
 *     AssetInput:
 *       type: object
 *       required:
 *         - category
 *         - name
 *         - ticker
 *       properties:
 *         category:
 *           type: string
 *           description: Asset category
 *           enum: [currency, crypto, KOSPI, KOSDAQ, NASDAQ, NYSE]
 *           example: "crypto"
 *         name:
 *           type: string
 *           description: Asset name
 *           example: "ETH"
 *         ticker:
 *           type: string
 *           description: Asset ticker symbol
 *           example: "ETH"
 *         unit:
 *           type: number
 *           description: Asset unit value
 *           example: 1
 */
interface IAsset {
  category: string
  name: string
  ticker: string
  unit: number
}

/**
 * Update or create an asset
 * @param {IAsset} data - Asset data to update or create
 * @throws {Error} When required fields are missing
 */
const updateAsset = async (data: IAsset) => {
  const { name, category, ticker, unit } = data

  if (!category || !name || !ticker) {
    throw new Error("Category, name, and ticker are required")
  }

  const newAsset: IAsset = data
  await AssetListModel.updateOne({ name, category, ticker }, newAsset, { upsert: true }).exec()
}

/**
 * @swagger
 * /api/asset:
 *   post:
 *     summary: Create a new asset
 *     description: Create a new asset with the provided information
 *     tags: [Asset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssetInput'
 *     responses:
 *       201:
 *         description: Asset created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Asset created successfully"
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category, name, and ticker are required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating asset"
 */
// @ts-ignore
router.post("/", async (req, res) => {
  try {
    const { name, ticker, category, unit } = req.body

    // Validate required fields
    if (!name || !ticker || !category || !unit) {
      return res.status(400).json({ message: "Name, ticker, category, and unit are required" })
    }

    // Validate category
    const validCategories = ["currency", "crypto", "KOSPI", "KOSDAQ", "NASDAQ", "NYSE"]
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid category" })
    }

    // Check if asset ticker already exists
    const existingAsset = await AssetListModel.findOne({ category, ticker }).exec()
    if (existingAsset) {
      return res.status(400).json({ message: "Asset category&ticker already exists" })
    }

    // Create new asset
    const newAsset = new AssetListModel({
      name,
      ticker,
      category,
      unit,
    })

    const savedAsset = await newAsset.save()

    res.status(201).json({
      message: "Asset created successfully",
      data: savedAsset,
    })
  } catch (error) {
    console.error("Error creating asset:", error)
    res.status(500).json({ message: "Error creating asset" })
  }
})

/**
 * @swagger
 * /api/asset/{id}:
 *   put:
 *     summary: Update asset by ID
 *     description: Update an existing asset with the provided information
 *     tags: [Asset]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Asset ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssetInput'
 *     responses:
 *       200:
 *         description: Asset updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Asset updated successfully"
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category, name, and ticker are required"
 *       404:
 *         description: Asset not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error updating asset"
 */
// @ts-ignore
router.put("/:id", async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid asset ID" })
    }

    const { name, ticker, category, unit } = req.body

    // Validate required fields
    if (!name || !ticker || !category || !unit) {
      return res.status(400).json({ message: "Name, ticker, category, and unit are required" })
    }

    // Check if asset exists
    const existingAsset = await AssetListModel.findById(req.params.id).exec()
    if (!existingAsset) {
      return res.status(404).json({ message: "Asset not found" })
    }

    // Update asset
    const updatedAsset = await AssetListModel.findByIdAndUpdate(
      req.params.id,
      { name, ticker, category, unit },
      { new: true }
    ).exec()

    res.status(200).json({ message: "Asset updated successfully" })
  } catch (error) {
    console.error("Error updating asset:", error)
    res.status(500).json({ message: "Error updating asset" })
  }
})

/**
 * @swagger
 * /api/asset/{id}:
 *   delete:
 *     summary: Delete asset by ID
 *     description: Delete a specific asset by its ID
 *     tags: [Asset]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Asset ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Asset deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Asset deleted successfully"
 *       404:
 *         description: Asset not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error deleting asset"
 */
// @ts-ignore
router.delete("/:id", async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid asset ID" })
    }

    const assetId = req.params.id

    // Check if asset exists before deleting
    const existingAsset = await AssetListModel.findById(assetId).exec()
    if (!existingAsset) {
      return res.status(404).json({ message: "Asset not found" })
    }

    await AssetListModel.findByIdAndDelete(assetId).exec()
    res.status(200).json({ message: "Asset deleted successfully" })
  } catch (error) {
    console.error("Error deleting asset:", error)
    res.status(500).json({ message: "Error deleting asset" })
  }
})
export default router
