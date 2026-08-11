import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  addStockMovement,
  getStockHistory,
} from '../controllers/product.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Enforce authentication on all product endpoints
router.use(authenticate);

// 1. List Products (All authorized roles: ADMIN, WAREHOUSE, SALES, ACCOUNTS)
router.get('/', authorize('ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS'), getProducts);

// 2. Create Product (ADMIN & WAREHOUSE only)
router.post('/', authorize('ADMIN', 'WAREHOUSE'), createProduct);

// 3. Get Product Details with low-stock warning flag (All roles)
router.get('/:id', authorize('ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS'), getProductById);

// 4. Update Product Details (ADMIN & WAREHOUSE only)
router.put('/:id', authorize('ADMIN', 'WAREHOUSE'), updateProduct);

// 5. Record Stock Movement (ADMIN & WAREHOUSE only) - Supports /stock and /stock-movement
router.post('/:id/stock', authorize('ADMIN', 'WAREHOUSE'), addStockMovement);
router.post('/:id/stock-movement', authorize('ADMIN', 'WAREHOUSE'), addStockMovement);

// 6. Get Paginated Stock History (All roles) - Supports /history and /stock-history
router.get('/:id/history', authorize('ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS'), getStockHistory);
router.get('/:id/stock-history', authorize('ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS'), getStockHistory);

export default router;
