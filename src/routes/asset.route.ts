import express from 'express';
import assetController from '../controllers/asset.controller';

const router = express.Router();

router.post('/', assetController.createAsset);
router.get('/:asset_id/data/:date', assetController.getAssetDataByDate);

export default router;
