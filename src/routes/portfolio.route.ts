import express from 'express';
import pctrl from '../controllers/portfolio.controller';

const router = express.Router();

router.post('/', pctrl.createPortfolio);
router.post('/:portfolio_id/assets', pctrl.addAssetToPortfolio);
router.get('/:portfolio_id/snapshot/:date', pctrl.getPortfolioSnapshotByDate);
router.get('/:portfolio_id/snapshots', pctrl.getPortfolioSnapshots);
router.get('/list', pctrl.getPortfolioList);


export default router;

