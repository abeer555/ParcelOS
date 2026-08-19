import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      errors: err.errors,
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        status: 'error',
        message: 'A record with this value already exists.',
      });
    }

    if (err.code === 'P2021') {
      return res.status(500).json({
        status: 'error',
        message: 'Database schema is missing. Run Prisma schema sync on the deployed database.',
      });
    }
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    return res.status(500).json({
      status: 'error',
      message: 'Database connection failed. Verify DATABASE_URL and database network access.',
    });
  }

  console.error('UNEXPECTED ERROR:', err);

  return res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
};
