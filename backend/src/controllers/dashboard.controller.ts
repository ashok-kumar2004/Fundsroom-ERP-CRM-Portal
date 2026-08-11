import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [
      totalCustomers,
      totalProducts,
      products,
      totalChallans,
      draftChallanCount,
      confirmedChallans,
      recentChallans,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.product.count(),
      prisma.product.findMany({ select: { currentStock: true, minStockAlert: true } }),
      prisma.challan.count(),
      prisma.challan.count({ where: { status: 'DRAFT' } }),
      prisma.challan.findMany({
        where: { status: 'CONFIRMED' },
        include: { ChallanItems: true },
      }),
      prisma.challan.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { name: true, businessName: true } } },
      }),
    ]);

    const lowStockCount = products.filter((p) => p.currentStock <= p.minStockAlert).length;

    const confirmedChallansValue = confirmedChallans.reduce((total, challan) => {
      const challanVal = challan.ChallanItems.reduce(
        (sum, item) => sum + item.unitPriceSnapshot * item.quantity,
        0
      );
      return total + challanVal;
    }, 0);

    res.json({
      success: true,
      stats: {
        totalCustomers,
        totalProducts,
        lowStockCount,
        totalChallans,
        draftChallanCount,
        confirmedChallansValue,
      },
      recentChallans,
    });
  } catch (error) {
    next(error);
  }
};
