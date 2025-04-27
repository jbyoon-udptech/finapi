import express from 'express';
import portfolioController from '../controllers/portfolio.controller';

const router = express.Router();

router.post('/', portfolioController.createPortfolio);
router.post('/:portfolio_id/assets', portfolioController.addAssetToPortfolio);
router.get('/:portfolio_id/snapshot/:date', portfolioController.getPortfolioSnapshotByDate);
router.get('/:portfolio_id/snapshots', portfolioController.getPortfolioSnapshots);

export default router;
