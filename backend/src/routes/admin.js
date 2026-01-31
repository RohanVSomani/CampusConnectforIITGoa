

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { query } from 'express-validator';
import { validate, catchAsync } from '../middleware/validate.js';
import * as adminController from '../controllers/adminController.js';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/stats', catchAsync(adminController.stats));
router.get(
  '/users',
  [query('role').optional().isIn(['student', 'admin', 'shop', 'driver'])],
  validate,
  catchAsync(adminController.users)
);
router.get('/activity', catchAsync(adminController.activity));

export default router;
