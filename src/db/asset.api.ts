// asset APIs

import { Router, Request, Response } from "express"
import { AssetList, AssetListModel } from "./asset.model"

const router = Router()

/**
 * @swagger
 * /asset:
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
 * /asset/{id}:
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
router.get("/:id", async (req: Request<{ id: string }>, res: Response) => {
  const asset = await AssetListModel.findById(req.params.id).exec()

  if (asset) {
    res.json(asset)
  } else {
    res.status(404).json({ message: "Asset not found" })
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
 * /asset:
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
router.post("/", async (req: Request, res: Response) => {
  try {
    const data: IAsset = req.body
    await updateAsset(data)
    res.status(201).json({ message: "Asset created successfully" })
  } catch (error) {
    console.error("Error creating asset:", error)
    res.status(500).json({ message: "Error creating asset" })
  }
})

/**
 * @swagger
 * /asset/{id}:
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
router.put("/:id", async (req: Request<{ id: string }>, res: Response) => {
  try {
    const data: IAsset = req.body
    await updateAsset(data)
    res.status(200).json({ message: "Asset updated successfully" })
  } catch (error) {
    console.error("Error updating asset:", error)
    res.status(500).json({ message: "Error updating asset" })
  }
})

/**
 * @swagger
 * /asset/{id}:
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
router.delete("/:id", async (req: Request<{ id: string }>, res: Response) => {
  try {
    const assetId = req.params.id
    await AssetListModel.findByIdAndDelete(assetId).exec()
    res.status(200).json({ message: "Asset deleted successfully" })
  } catch (error) {
    console.error("Error deleting asset:", error)
    res.status(500).json({ message: "Error deleting asset" })
  }
})
export default router
