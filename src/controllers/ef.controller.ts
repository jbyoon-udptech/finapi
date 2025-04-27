import { Request, Response, NextFunction } from 'express';
import efService from '../services/external-data';

const getExternalData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, ticker, date } = req.params;
    const data = await efService.fetchExternalData(category, ticker, date);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export default { getExternalData };
