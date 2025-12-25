import type { Request, Response, NextFunction } from 'express';
import { JWTPayload, logError, ServiceError } from '../types';
import { createErrorResponse } from '../utils';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      sessionId?: string;
    }
  }
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function validateRequest(scheme: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = scheme.safeParse(req.body);

    if (!result.success) {
      const errors: Record<string, string[]> = {};
      result.error.issues.forEach((issue: any) => {
        const field = issue.path.join('.');
        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field].push(issue.message);
      });

      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors,
      });
    }
    next();
  };
}

export function errorHandler(
  error: ServiceError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logError(error, {
    method: req.method,
    url: req.url,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json(createErrorResponse(message));

  next();
}

export function corsOptions() {
  return {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'PUT', 'OPTIONS', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
}

export function authenticateSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(new ServiceError('No Authorization header', 401));
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return next(new ServiceError('Access token required', 401));
  }

  const jwtSecret = process.env.JWT_ACCESS_SECRET;

  if (!jwtSecret) {
    return next(new ServiceError('JWT secret not found', 500));
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    req.userId = decoded.userId;
    req.sessionId = decoded.sessionId;

    next();
  } catch (error) {
    return next(new ServiceError('Invalid access token', 401));
  }
}
