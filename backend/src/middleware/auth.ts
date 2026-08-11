import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: Role;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Authentication required. Missing or malformed Authorization header.',
    });
    return;
  }

  const token = authHeader.split(' ')[1] || '';
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey') as {
      userId: string;
      email: string;
      role: Role;
    };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};

export const authorize = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required before accessing this resource.',
      });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden. Your role '${req.user.role}' is not authorized to access this resource.`,
      });
      return;
    }
    next();
  };
};
