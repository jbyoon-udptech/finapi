import { Request, Response, NextFunction } from 'express';
import portfolioService from '../services/portfolio.service';

const createPortfolio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const portfolio = await portfolioService.createPortfolio(req.body.name);
    res.status(201).json(portfolio);
  } catch (error) {
    next(error);
  }
};

const addAssetToPortfolio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { portfolio_id } = req.params;
    await portfolioService.addOrUpdateAssetToPortfolio(portfolio_id, req.body);
    res.json({ portfolio_id, message: 'Portfolio updated successfully.' });
  } catch (error) {
    next(error);
  }
};

const getPortfolioSnapshotByDate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { portfolio_id, date } = req.params;
    const snapshot = await portfolioService.getPortfolioSnapshotByDate(portfolio_id, date);
    res.json(snapshot);
  } catch (error) {
    next(error);
  }
};

const getPortfolioSnapshots = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { portfolio_id } = req.params;
    const snapshots = await portfolioService.getPortfolioSnapshots(portfolio_id);
    res.json(snapshots);
  } catch (error) {
    next(error);
  }
};

export default {
  createPortfolio,
  addAssetToPortfolio,
  getPortfolioSnapshotByDate,
  getPortfolioSnapshots,
};
