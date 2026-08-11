import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('[Error Pipeline]:', err);

  let status = err.status || 500;
  let message = err.message || 'Internal Server Error';
  let errors = undefined;

  if (err instanceof ZodError) {
    status = 400;
    message = 'Validation Error';
    const issues = err.issues || (err as any).errors || [];
    errors = issues.map((e: any) => ({
      field: Array.isArray(e.path) ? e.path.join('.') : '',
      message: e.message,
    }));
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    status = 400;
    message = `Database Error (${err.code})`;
    errors = [{ code: err.code, meta: err.meta }];
  } else if (err.name === 'UnauthorizedError') {
    status = 401;
    message = 'Unauthorized access';
  }

  res.status(status).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};
