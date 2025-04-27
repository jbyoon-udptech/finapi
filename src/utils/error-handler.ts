import { Request, Response, NextFunction } from 'express';

class APIError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

const errorHandler = (err: APIError, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ message: err.message || 'Internal Server Error' });
};

export { APIError, errorHandler };
