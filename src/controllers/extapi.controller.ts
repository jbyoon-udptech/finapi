import { Request, Response, NextFunction } from "express"
import { fetchExternalData } from "../services/external-api"

export const getExternalData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category, ticker, date } = req.params
    const data = await fetchExternalData(category, ticker, date)
    res.json(data)
  } catch (error) {
    next(error)
  }
}

export default { getExternalData }
