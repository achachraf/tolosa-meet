import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.message
    });
  }

  if (err.code === 'auth/email-already-exists') {
    return res.status(409).json({
      error: 'Email already exists'
    });
  }

  if (err.code === 'auth/user-not-found') {
    return res.status(404).json({
      error: 'User not found'
    });
  }

  res.status(500).json({
    error: 'Internal server error'
  });
};

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found'
  });
};
