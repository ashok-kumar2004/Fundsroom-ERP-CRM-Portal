import { Router } from 'express';
import prisma from '../config/db';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    // Simple DB ping
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      message: 'Server is healthy and DB is connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
