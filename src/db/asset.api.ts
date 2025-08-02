// asset APIs

import { Router, Request, Response } from "express"
import { AssetList, AssetListModel } from "./asset.model"

const router = Router()

// GET /asset - read all assets
router.get("/", async (req: Request, res: Response) => {
  const assets = await AssetListModel.find()
  res.json(assets)
})

// GET /asset/:id - 특정 자산 가져오기
router.get("/:id", async (req: Request<{ id: string }>, res: Response) => {
  const asset = await AssetListModel.findById(req.params.id).exec()

  if (asset) {
    res.json(asset)
  } else {
    res.status(404).json({ message: "Asset not found" })
  }
})

interface IAsset {
  category: string
  name: string
  ticker: string
  unit: number
}

const updateAsset = async (data: IAsset) => {
  const { name, category, ticker, unit } = data

  if (!category || !name || !ticker) {
    throw new Error("Category, name, and ticker are required")
  }

  const newAsset: IAsset = data
  await AssetListModel.updateOne({ name, category, ticker }, newAsset, { upsert: true }).exec()
}

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
