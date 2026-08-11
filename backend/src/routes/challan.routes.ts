import { Router } from 'express';
import {
  createChallan,
  confirmChallan,
  cancelChallan,
  getChallans,
  getChallanById,
} from '../controllers/challan.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Enforce authentication on all challan endpoints
router.use(authenticate);

// 1. List Challans with pagination & filters (All roles: ADMIN, SALES, WAREHOUSE, ACCOUNTS)
router.get('/', authorize('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), getChallans);

// 2. Create Challan (ADMIN & SALES only)
router.post('/', authorize('ADMIN', 'SALES'), createChallan);

// 3. Get Single Challan Detail (All roles)
router.get('/:id', authorize('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), getChallanById);

// 4. Confirm a DRAFT Challan (ADMIN, SALES, WAREHOUSE) - Support both POST and PUT
router.post('/:id/confirm', authorize('ADMIN', 'SALES', 'WAREHOUSE'), confirmChallan);
router.put('/:id/confirm', authorize('ADMIN', 'SALES', 'WAREHOUSE'), confirmChallan);

// 5. Cancel a Challan (ADMIN & SALES only) - Support both POST and PUT
router.post('/:id/cancel', authorize('ADMIN', 'SALES'), cancelChallan);
router.put('/:id/cancel', authorize('ADMIN', 'SALES'), cancelChallan);

export default router;
