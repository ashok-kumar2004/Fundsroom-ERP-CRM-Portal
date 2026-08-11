import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU/code is required'),
  category: z.string().optional().or(z.literal('')),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  currentStock: z.number().int().min(0, 'Current stock must be non-negative').default(0),
  minStockAlert: z.number().int().min(0, 'Minimum stock alert must be non-negative').default(0),
  location: z.string().optional().or(z.literal('')),
});

export const updateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU/code is required'),
  category: z.string().optional().or(z.literal('')),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  minStockAlert: z.number().int().min(0, 'Minimum stock alert must be non-negative').default(0),
  location: z.string().optional().or(z.literal('')),
});

export const stockMovementSchema = z.object({
  quantityChanged: z.number().int().positive('Quantity changed must be a positive integer'),
  movementType: z.enum(['IN', 'OUT']),
  reason: z.string().optional().or(z.literal('')),
});

export const createProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parseResult = createProductSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: parseResult.error.issues.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
      return;
    }

    const data = parseResult.data;

    // Check duplicate SKU -> Return HTTP 409 Conflict
    const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (existingSku) {
      res.status(409).json({
        success: false,
        message: `Product SKU '${data.sku}' already exists`,
      });
      return;
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        category: data.category || null,
        unitPrice: data.unitPrice,
        currentStock: data.currentStock,
        minStockAlert: data.minStockAlert,
        location: data.location || null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: {
        ...product,
        isLowStock: product.currentStock <= product.minStockAlert,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const search = (req.query.search as string) || '';
    const category = (req.query.category as string) || '';
    const lowStock = req.query.lowStock === 'true' || req.query.lowStockOnly === 'true';

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    if (category) {
      where.category = category;
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const mappedProducts = products.map((p) => ({
      ...p,
      isLowStock: p.currentStock <= p.minStockAlert,
    }));

    const filteredData = lowStock
      ? mappedProducts.filter((p) => p.isLowStock)
      : mappedProducts;

    res.status(200).json({
      success: true,
      data: filteredData,
      pagination: {
        total: lowStock ? filteredData.length : total,
        page,
        limit,
        totalPages: Math.ceil((lowStock ? filteredData.length : total) / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.status(200).json({
      success: true,
      product: {
        ...product,
        isLowStock: product.currentStock <= product.minStockAlert,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const parseResult = updateProductSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: parseResult.error.issues.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
      return;
    }

    const data = parseResult.data;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    // Check duplicate SKU if SKU changed -> Return HTTP 409 Conflict
    if (data.sku !== existing.sku) {
      const duplicate = await prisma.product.findUnique({ where: { sku: data.sku } });
      if (duplicate) {
        res.status(409).json({
          success: false,
          message: `Product SKU '${data.sku}' already exists`,
        });
        return;
      }
    }

    // Update details only — stock is preserved
    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        sku: data.sku,
        category: data.category || null,
        unitPrice: data.unitPrice,
        minStockAlert: data.minStockAlert,
        location: data.location || null,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Product details updated successfully',
      product: {
        ...updated,
        isLowStock: updated.currentStock <= updated.minStockAlert,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const addStockMovement = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id: productId } = req.params;
    const parseResult = stockMovementSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: parseResult.error.issues.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
      return;
    }

    const { quantityChanged, movementType, reason } = parseResult.data;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    // Execute atomic transaction for pessimistic / conditional stock update & log insertion
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) {
        return { error: 'NOT_FOUND', status: 404, message: 'Product not found' };
      }

      if (movementType === 'OUT' && product.currentStock - quantityChanged < 0) {
        return {
          error: 'INSUFFICIENT_STOCK',
          status: 400,
          message: 'Insufficient stock',
          currentStock: product.currentStock,
        };
      }

      const newStock =
        movementType === 'IN'
          ? product.currentStock + quantityChanged
          : product.currentStock - quantityChanged;

      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { currentStock: newStock },
      });

      const movement = await tx.stockMovement.create({
        data: {
          id: `sm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          productId,
          quantityChanged,
          movementType,
          reason: reason || null,
          createdBy: userId,
        },
        include: {
          user: { select: { id: true, name: true, role: true } },
        },
      });

      return { updatedProduct, movement };
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
      message: `Stock movement recorded successfully (${movementType} ${quantityChanged})`,
      product: {
        ...result.updatedProduct,
        isLowStock: result.updatedProduct.currentStock <= result.updatedProduct.minStockAlert,
      },
      stockMovement: result.movement,
    });
  } catch (error) {
    next(error);
  }
};

export const getStockHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id: productId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    const [total, history] = await Promise.all([
      prisma.stockMovement.count({ where: { productId } }),
      prisma.stockMovement.findMany({
        where: { productId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, role: true } },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: history,
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
