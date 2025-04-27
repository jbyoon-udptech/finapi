import { Request, Response, NextFunction } from 'express';
import assetService from '../services/asset.service';

const createAsset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const asset = await assetService.createAsset(req.body);
    res.status(201).json(asset);
  } catch (error) {
    next(error);
  }
};

const getAssetDataByDate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { asset_id, date } = req.params;
    const data = await assetService.getAssetDataByDate(asset_id, date);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export default { createAsset, getAssetDataByDate };
