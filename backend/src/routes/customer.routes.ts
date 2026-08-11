import { Router } from 'express';
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  addFollowUp,
} from '../controllers/customer.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Require authentication for all customer routes
router.use(authenticate);

// List and Create (Allowed for ADMIN, SALES, ACCOUNTS)
router.get('/', authorize('ADMIN', 'SALES', 'ACCOUNTS'), getCustomers);
router.post('/', authorize('ADMIN', 'SALES'), createCustomer);

// Detail, Update, and Add FollowUp
router.get('/:id', authorize('ADMIN', 'SALES', 'ACCOUNTS'), getCustomerById);
router.put('/:id', authorize('ADMIN', 'SALES'), updateCustomer);
router.post('/:id/notes', authorize('ADMIN', 'SALES', 'ACCOUNTS'), addFollowUp);
router.post('/:id/follow-ups', authorize('ADMIN', 'SALES', 'ACCOUNTS'), addFollowUp);

export default router;
