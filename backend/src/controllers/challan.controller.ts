import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const challanItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer greater than zero'),
});

export const createChallanSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  status: z.enum(['DRAFT', 'CONFIRMED']).default('DRAFT'),
  items: z.array(challanItemSchema).min(1, 'At least one item is required in a sales challan'),
});

/**
 * Helper to generate sequential 4-digit Challan number: CH-{YEAR}-{0001}
 */
async function generateChallanNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `CH-${currentYear}-`;

  // Find latest challan for current year
  const latestChallan = await prisma.challan.findFirst({
    where: {
      challanNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  let nextSequence = 1;
  if (latestChallan && latestChallan.challanNumber) {
    const parts = latestChallan.challanNumber.split('-');
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) {
      nextSequence = lastSeq + 1;
    }
  }

  const formattedSeq = nextSequence.toString().padStart(4, '0');
  return `${prefix}${formattedSeq}`;
}

export const createChallan = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parseResult = createChallanSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: parseResult.error.issues.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
      return;
    }

    const { customerId, status, items } = parseResult.data;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    // Verify customer exists
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }

    // Fetch product details for all requested item IDs
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Validate that all products exist
    const missingProduct = items.find((i) => !productMap.has(i.productId));
    if (missingProduct) {
      res.status(400).json({
        success: false,
        message: `Product with ID '${missingProduct.productId}' does not exist or has been deleted`,
      });
      return;
    }

    // Prepare line item snapshots & calculate total quantity
    let totalQuantity = 0;
    const preparedItems = items.map((item) => {
      const p = productMap.get(item.productId)!;
      totalQuantity += item.quantity;
      return {
        productId: p.id,
        productNameSnapshot: p.name,
        productSkuSnapshot: p.sku,
        unitPriceSnapshot: p.unitPrice,
        quantity: item.quantity,
      };
    });

    const challanNumber = await generateChallanNumber();

    // Execute atomic transaction for stock validation, deduction, movement log, and challan creation
    const result = await prisma.$transaction(async (tx) => {
      if (status === 'CONFIRMED') {
        // STOCK-SAFETY: Pre-check stock availability for ALL items in single pass before making changes
        const stockShortages: string[] = [];

        for (const item of items) {
          const currentProd = await tx.product.findUnique({ where: { id: item.productId } });
          if (!currentProd) {
            stockShortages.push(`Product ID '${item.productId}' no longer exists`);
            continue;
          }
          if (currentProd.currentStock < item.quantity) {
            const shortBy = item.quantity - currentProd.currentStock;
            stockShortages.push(
              `Product '${currentProd.name}' (${currentProd.sku}) has available stock: ${currentProd.currentStock}, requested: ${item.quantity} (Short by: ${shortBy})`
            );
          }
        }

        if (stockShortages.length > 0) {
          return {
            error: 'INSUFFICIENT_STOCK',
            status: 400,
            message: `Insufficient stock to confirm Challan: ${stockShortages.join('; ')}`,
          };
        }

        // Deduct stock & create StockMovement OUT for each item
        for (const item of items) {
          const p = productMap.get(item.productId)!;
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } },
          });

          await tx.stockMovement.create({
            data: {
              id: `sm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              productId: item.productId,
              quantityChanged: item.quantity,
              movementType: 'OUT',
              reason: `Sales Challan ${challanNumber}`,
              createdBy: userId,
            },
          });
        }
      }

      // Create Challan & ChallanItems
      const newChallan = await tx.challan.create({
        data: {
          id: `chal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          challanNumber,
          customerId,
          totalQuantity,
          status,
          createdBy: userId,
          ChallanItems: {
            create: preparedItems,
          },
        },
        include: {
          customer: true,
          user: { select: { id: true, name: true, role: true } },
          ChallanItems: true,
        },
      });

      return { newChallan };
    });

    if ('error' in result) {
      res.status(result.status).json({
        success: false,
        message: result.message,
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: `Sales Challan ${challanNumber} created successfully as ${status}`,
      challan: result.newChallan,
    });
  } catch (error) {
    next(error);
  }
};

export const confirmChallan = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const challan = await prisma.challan.findUnique({
      where: { id },
      include: { ChallanItems: true },
    });

    if (!challan) {
      res.status(404).json({ success: false, message: 'Sales Challan not found' });
      return;
    }

    // EDGE CASE: If already CONFIRMED or CANCELLED -> Return HTTP 409 Conflict
    if (challan.status !== 'DRAFT') {
      res.status(409).json({
        success: false,
        message: `Cannot confirm Challan '${challan.challanNumber}'. Current status is '${challan.status}' (Must be 'DRAFT').`,
      });
      return;
    }

    // Execute atomic transaction for stock validation & deduction
    const result = await prisma.$transaction(async (tx) => {
      const stockShortages: string[] = [];

      for (const item of challan.ChallanItems) {
        if (!item.productId) continue; // If product was deleted, snapshot preserved
        const currentProd = await tx.product.findUnique({ where: { id: item.productId } });
        if (!currentProd) {
          stockShortages.push(`Product '${item.productNameSnapshot}' (SKU: ${item.productSkuSnapshot}) is no longer in catalog`);
          continue;
        }
        if (currentProd.currentStock < item.quantity) {
          const shortBy = item.quantity - currentProd.currentStock;
          stockShortages.push(
            `Product '${currentProd.name}' (${currentProd.sku}) has available stock: ${currentProd.currentStock}, requested: ${item.quantity} (Short by: ${shortBy})`
          );
        }
      }

      if (stockShortages.length > 0) {
        return {
          error: 'INSUFFICIENT_STOCK',
          status: 400,
          message: `Insufficient stock to confirm Challan ${challan.challanNumber}: ${stockShortages.join('; ')}`,
        };
      }

      // Deduct stock & create StockMovement OUT
      for (const item of challan.ChallanItems) {
        if (!item.productId) continue;

        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: { decrement: item.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            id: `sm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            productId: item.productId,
            quantityChanged: item.quantity,
            movementType: 'OUT',
            reason: `Sales Challan ${challan.challanNumber}`,
            createdBy: userId,
          },
        });
      }

      // Update status to CONFIRMED
      const updatedChallan = await tx.challan.update({
        where: { id },
        data: { status: 'CONFIRMED' },
        include: {
          customer: true,
          user: { select: { id: true, name: true, role: true } },
          ChallanItems: true,
        },
      });

      return { updatedChallan };
    });

    if ('error' in result) {
      res.status(result.status).json({
        success: false,
        message: result.message,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Sales Challan ${challan.challanNumber} confirmed and stock deducted successfully`,
      challan: result.updatedChallan,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelChallan = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const challan = await prisma.challan.findUnique({
      where: { id },
      include: { ChallanItems: true },
    });

    if (!challan) {
      res.status(404).json({ success: false, message: 'Sales Challan not found' });
      return;
    }

    // EDGE CASE: If already CANCELLED -> Return HTTP 409 Conflict
    if (challan.status === 'CANCELLED') {
      res.status(409).json({
        success: false,
        message: `Challan '${challan.challanNumber}' is already CANCELLED.`,
      });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      // If challan was CONFIRMED, REVERSE the stock deduction (Add stock back)
      if (challan.status === 'CONFIRMED') {
        for (const item of challan.ChallanItems) {
          if (!item.productId) continue;

          // Add stock back
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { increment: item.quantity } },
          });

          // Log StockMovement IN
          await tx.stockMovement.create({
            data: {
              id: `sm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              productId: item.productId,
              quantityChanged: item.quantity,
              movementType: 'IN',
              reason: `Challan ${challan.challanNumber} cancelled`,
              createdBy: userId,
            },
          });
        }
      }

      // Set status to CANCELLED
      const cancelledChallan = await tx.challan.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: {
          customer: true,
          user: { select: { id: true, name: true, role: true } },
          ChallanItems: true,
        },
      });

      return { cancelledChallan };
    });

    res.status(200).json({
      success: true,
      message: `Challan ${challan.challanNumber} cancelled successfully${
        challan.status === 'CONFIRMED' ? ' and stock restored' : ''
      }`,
      challan: result.cancelledChallan,
    });
  } catch (error) {
    next(error);
  }
};

export const getChallans = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const status = req.query.status as string;
    const customerId = req.query.customerId as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const search = req.query.search as string;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (search) {
      where.OR = [
        { challanNumber: { contains: search } },
        { customer: { name: { contains: search } } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [total, challans] = await Promise.all([
      prisma.challan.count({ where }),
      prisma.challan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          user: { select: { id: true, name: true, role: true } },
          ChallanItems: true,
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: challans,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getChallanById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;

    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        customer: true,
        user: { select: { id: true, name: true, role: true } },
        ChallanItems: {
          include: {
            product: { select: { id: true, currentStock: true, minStockAlert: true } },
          },
        },
      },
    });

    if (!challan) {
      res.status(404).json({ success: false, message: 'Sales Challan not found' });
      return;
    }

    res.status(200).json({
      success: true,
      challan,
    });
  } catch (error) {
    next(error);
  }
};
